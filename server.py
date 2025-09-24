from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import jwt
from passlib.context import CryptContext
import httpx
from google.oauth2 import id_token
from google.auth.transport import requests

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Conexión a MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Crear la aplicación principal sin prefijo
app = FastAPI(title="ReporteBuenaventura - Plataforma de Quejas Ciudadanas")

# Crear un router con el prefijo /api
api_router = APIRouter(prefix="/api")

# Seguridad
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-buenaventura-2025-secure')
ALGORITHM = "HS256"

# Clave de Emergent LLM
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Configuración de Google OAuth
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '292558896580-7j5dg4pdjjdmqakj6b9ppu3vp7h5g4eh.apps.googleusercontent.com')

# === MODELOS ===
class User(BaseModel):
    """Modelo de usuario del sistema"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    auth_provider: str = "local"  # "local" o "google"

class UserCreate(BaseModel):
    """Modelo para crear un nuevo usuario"""
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    """Modelo para el inicio de sesión de usuario"""
    email: EmailStr
    password: str

class GoogleLoginData(BaseModel):
    """Modelo para datos de inicio de sesión con Google"""
    google_token: str

class Token(BaseModel):
    """Modelo de token de acceso"""
    access_token: str
    token_type: str = "bearer"
    user: User

class ComplaintCategory(BaseModel):
    """Modelo de categoría de queja"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    responsible_entity: str
    description: str

class Complaint(BaseModel):
    """Modelo principal de queja ciudadana"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    responsible_entity: Optional[str] = None
    location: dict  # {lat, lng, address}
    status: str = "recibido"  # recibido, en_proceso, resuelto
    user_id: str
    user_email: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rating: Optional[int] = None
    rating_comment: Optional[str] = None

class ComplaintCreate(BaseModel):
    """Modelo para crear una nueva queja"""
    title: str
    description: str
    location: dict  # {lat, lng, address}

class ComplaintUpdate(BaseModel):
    """Modelo para actualizar el estado de una queja"""
    status: str

class ComplaintRating(BaseModel):
    """Modelo para calificar una queja"""
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ComplaintStats(BaseModel):
    """Modelo de estadísticas de quejas"""
    total_complaints: int
    by_status: dict
    by_category: dict
    average_rating: Optional[float]

# === FUNCIONES UTILITARIAS ===
def verify_password(plain_password, hashed_password):
    """Verificar contraseña en texto plano contra hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Generar hash de contraseña"""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Crear token de acceso JWT"""
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Obtener usuario actual desde el token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Credenciales de autenticación inválidas")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Credenciales de autenticación inválidas")

async def verify_google_token(token: str):
    """Verificar token de Google OAuth"""
    try:
        # Verificar el token de Google
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Emisor incorrecto.')
        
        return {
            'email': idinfo['email'],
            'name': idinfo['name'],
            'google_id': idinfo['sub']
        }
    except ValueError as e:
        logging.error(f"Falló la verificación del token de Google: {e}")
        return None

async def classify_complaint_with_ai(title: str, description: str) -> dict:
    """Clasificar queja usando ChatGPT"""
    if not EMERGENT_LLM_KEY:
        # Recurrir a clasificación básica
        return classify_complaint_basic(title + " " + description)
    
    try:
        headers = {
            "Authorization": f"Bearer {EMERGENT_LLM_KEY}",
            "Content-Type": "application/json"
        }
        
        categories = [
            {"name": "Alumbrado Público", "entity": "Secretaría de Infraestructura"},
            {"name": "Vías y Calles", "entity": "Secretaría de Infraestructura"},
            {"name": "Recolección de Basuras", "entity": "Empresa de Servicios Públicos"},
            {"name": "Agua Potable", "entity": "Empresa de Servicios Públicos"},
            {"name": "Alcantarillado", "entity": "Empresa de Servicios Públicos"},
            {"name": "Seguridad", "entity": "Secretaría de Gobierno"},
            {"name": "Otros", "entity": "Alcaldía Municipal"}
        ]
        
        categories_text = "\n".join([f"- {cat['name']}: {cat['entity']}" for cat in categories])
        
        prompt = f"""Analiza la siguiente queja ciudadana y clasifícala en una de estas categorías:

{categories_text}

Título: {title}
Descripción: {description}

Responde ÚNICAMENTE en formato JSON:
{{"category": "nombre_categoria", "entity": "entidad_responsable"}}"""

        data = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.3
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=30.0
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"].strip()
                
                # Intentar parsear respuesta JSON
                import json
                try:
                    classification = json.loads(content)
                    return {
                        "category": classification.get("category", "Otros"),
                        "entity": classification.get("entity", "Alcaldía Municipal")
                    }
                except json.JSONDecodeError:
                    pass
    
    except Exception as e:
        logging.error(f"Error en clasificación con IA: {e}")
    
    # Recurrir a clasificación básica
    return classify_complaint_basic(title + " " + description)

def classify_complaint_basic(text: str) -> dict:
    """Clasificación básica basada en palabras clave"""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ["luz", "alumbrado", "poste", "luminaria", "lámpara"]):
        return {"category": "Alumbrado Público", "entity": "Secretaría de Infraestructura"}
    elif any(word in text_lower for word in ["hueco", "vía", "calle", "carrera", "pavimento", "asfalto"]):
        return {"category": "Vías y Calles", "entity": "Secretaría de Infraestructura"}
    elif any(word in text_lower for word in ["basura", "residuos", "recolección", "desechos", "limpieza"]):
        return {"category": "Recolección de Basuras", "entity": "Empresa de Servicios Públicos"}
    elif any(word in text_lower for word in ["agua", "acueducto", "tubería", "fuga"]):
        return {"category": "Agua Potable", "entity": "Empresa de Servicios Públicos"}
    elif any(word in text_lower for word in ["alcantarillado", "desagüe", "cloaca", "aguas negras"]):
        return {"category": "Alcantarillado", "entity": "Empresa de Servicios Públicos"}
    elif any(word in text_lower for word in ["seguridad", "robo", "delincuencia", "violencia", "inseguridad"]):
        return {"category": "Seguridad", "entity": "Secretaría de Gobierno"}
    else:
        return {"category": "Otros", "entity": "Alcaldía Municipal"}

# === RUTAS DE AUTENTICACIÓN ===
@api_router.post("/auth/register", response_model=Token)
async def register(user_create: UserCreate):
    """Registrar un nuevo usuario en el sistema"""
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    # Hashear contraseña y crear usuario
    hashed_password = get_password_hash(user_create.password)
    user_dict = user_create.dict()
    del user_dict["password"]
    user_dict["hashed_password"] = hashed_password
    user_dict["auth_provider"] = "local"
    
    user = User(**user_dict)
    await db.users.insert_one({**user.dict(), "hashed_password": hashed_password})
    
    # Crear token de acceso
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    """Iniciar sesión de usuario"""
    user_data = await db.users.find_one({"email": user_login.email})
    if not user_data or not verify_password(user_login.password, user_data.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos")
    
    user = User(**user_data)
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/google", response_model=Token)
async def google_login(google_data: GoogleLoginData):
    """Iniciar sesión con Google OAuth"""
    # Verificar token de Google
    google_user_info = await verify_google_token(google_data.google_token)
    
    if not google_user_info:
        raise HTTPException(status_code=400, detail="Token de Google inválido")
    
    # Verificar si el usuario existe
    user_data = await db.users.find_one({"email": google_user_info['email']})
    
    if user_data:
        # El usuario existe, iniciar sesión
        user = User(**user_data)
    else:
        # Crear nuevo usuario
        user_dict = {
            "email": google_user_info['email'],
            "full_name": google_user_info['name'],
            "auth_provider": "google",
            "google_id": google_user_info['google_id']
        }
        user = User(**user_dict)
        await db.users.insert_one({**user.dict(), "google_id": google_user_info['google_id']})
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user

# === RUTAS DE QUEJAS ===
@api_router.post("/complaints", response_model=Complaint)
async def create_complaint(complaint_create: ComplaintCreate, current_user: User = Depends(get_current_user)):
    """Crear una nueva queja ciudadana"""
    # Clasificar la queja
    classification = await classify_complaint_with_ai(complaint_create.title, complaint_create.description)
    
    complaint_dict = complaint_create.dict()
    complaint_dict.update({
        "user_id": current_user.id,
        "user_email": current_user.email,
        "category_name": classification["category"],
        "responsible_entity": classification["entity"]
    })
    
    complaint = Complaint(**complaint_dict)
    await db.complaints.insert_one(complaint.dict())
    return complaint

@api_router.get("/complaints", response_model=List[Complaint])
async def get_complaints(current_user: User = Depends(get_current_user)):
    """Obtener quejas del usuario actual"""
    complaints = await db.complaints.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    return [Complaint(**complaint) for complaint in complaints]

@api_router.get("/complaints/all", response_model=List[Complaint])
async def get_all_complaints():
    """Obtener todas las quejas públicas"""
    complaints = await db.complaints.find().sort("created_at", -1).to_list(100)
    return [Complaint(**complaint) for complaint in complaints]

@api_router.get("/complaints/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str, current_user: User = Depends(get_current_user)):
    """Obtener una queja específica del usuario"""
    complaint = await db.complaints.find_one({"id": complaint_id, "user_id": current_user.id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Queja no encontrada")
    return Complaint(**complaint)

@api_router.put("/complaints/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, complaint_update: ComplaintUpdate):
    """Actualizar el estado de una queja"""
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": complaint_update.status, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Queja no encontrada")
    return {"message": "Estado actualizado exitosamente"}

@api_router.put("/complaints/{complaint_id}/rating")
async def rate_complaint(complaint_id: str, rating: ComplaintRating, current_user: User = Depends(get_current_user)):
    """Calificar una queja"""
    result = await db.complaints.update_one(
        {"id": complaint_id, "user_id": current_user.id},
        {"$set": {"rating": rating.rating, "rating_comment": rating.comment, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Queja no encontrada")
    return {"message": "Calificación enviada exitosamente"}

@api_router.get("/complaints/stats/overview", response_model=ComplaintStats)
async def get_complaint_stats():
    """Obtener estadísticas generales de quejas"""
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total": {"$sum": 1},
                "statuses": {"$push": "$status"},
                "categories": {"$push": "$category_name"},
                "ratings": {"$push": "$rating"}
            }
        }
    ]
    
    result = list(await db.complaints.aggregate(pipeline).to_list(1))
    
    if not result:
        return ComplaintStats(
            total_complaints=0,
            by_status={},
            by_category={},
            average_rating=None
        )
    
    data = result[0]
    
    # Contar por estado
    status_counts = {}
    for status in data["statuses"]:
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Contar por categoría
    category_counts = {}
    for category in data["categories"]:
        if category:
            category_counts[category] = category_counts.get(category, 0) + 1
    
    # Calcular calificación promedio
    ratings = [r for r in data["ratings"] if r is not None]
    avg_rating = sum(ratings) / len(ratings) if ratings else None
    
    return ComplaintStats(
        total_complaints=data["total"],
        by_status=status_counts,
        by_category=category_counts,
        average_rating=avg_rating
    )

# Incluir el router en la aplicación principal
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Cerrar cliente de base de datos al apagar la aplicación"""
    client.close()

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
