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

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ReporteBuenaventura - Sistema de Reportes Ciudadanos")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-buenaventura-2025-secure')
ALGORITHM = "HS256"

# Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Google OAuth settings
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '292558896580-7j5dg4pdjjdmqakj6b9ppu3vp7h5g4eh.apps.googleusercontent.com')

# === MODELS ===
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    auth_provider: str = "local"  # "local" or "google"
    phone: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginData(BaseModel):
    google_token: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: User

class Entity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    website_url: str
    contact_email: str
    phone: str
    categories: List[str]  # List of problem categories they handle
    address: str

class Complaint(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category_name: Optional[str] = None
    responsible_entity: Optional[str] = None
    entity_info: Optional[dict] = None  # Full entity information
    location: dict  # {lat, lng, address}
    status: str = "recibido"  # recibido, en_proceso, realizado, solucionado
    user_id: str
    user_email: str
    user_name: str
    user_phone: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    rating: Optional[int] = None
    rating_comment: Optional[str] = None
    redirected_to_entity: bool = False
    comments: List[Comment] = []

class ComplaintCreate(BaseModel):
    title: str
    description: str
    location: dict  # {lat, lng, address}

class ComplaintUpdate(BaseModel):
    status: str

class ComplaintRating(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ComplaintStats(BaseModel):
    total_complaints: int
    by_status: dict
    by_category: dict
    by_entity: dict
    average_rating: Optional[float]

class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    complaint_id: str
    user_id: str
    user_name: str
    user_email: str
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CommentCreate(BaseModel):
    content: str

# === ENTITY DATABASE ===
ENTITIES_DATABASE = [
    {
        "id": "alcaldia-buenaventura",
        "name": "Alcaldía Municipal de Buenaventura",
        "description": "Administración municipal, trámites y servicios generales",
        "website_url": "https://www.buenaventura.gov.co",
        "contact_email": "contacto@buenaventura.gov.co",
        "phone": "+57 (2) 242-4000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Otros", "Trámites", "Servicios Generales", "Administración"]
    },
    {
        "id": "infraestructura-buenaventura",
        "name": "Secretaría de Infraestructura de Buenaventura",
        "description": "Responsable de vías, alumbrado público, obras civiles y mantenimiento de infraestructura urbana",
        "website_url": "https://www.buenaventura.gov.co/secretarias/infraestructura",
        "contact_email": "infraestructura@buenaventura.gov.co",
        "phone": "+57 (2) 242-4000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Alumbrado Público", "Vías y Calles", "Obras Civiles", "Puentes", "Andenes"]
    },
    {
        "id": "servicios-publicos-buenaventura",
        "name": "Empresa de Servicios Públicos de Buenaventura",
        "description": "Encargada del suministro de agua potable, alcantarillado y recolección de residuos",
        "website_url": "https://www.acueducto-buenaventura.gov.co",
        "contact_email": "servicios@buenaventura.gov.co",
        "phone": "+57 (2) 243-5000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Agua Potable", "Alcantarillado", "Recolección de Basuras", "Servicios Públicos"]
    },
    {
        "id": "policia-buenaventura",
        "name": "Policía Nacional - Distrito Especial Buenaventura",
        "description": "Seguridad ciudadana, orden público y atención de emergencias",
        "website_url": "https://www.policia.gov.co/contenido/distrito-especial-buenaventura",
        "contact_email": "denuncias.buenaventura@policia.gov.co",
        "phone": "123 (Línea de emergencia)",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Seguridad", "Robo", "Violencia", "Orden Público", "Emergencias"]
    },
    {
        "id": "transito-buenaventura",
        "name": "Secretaría de Tránsito y Transporte Distrital Buenaventura",
        "description": "Control de tránsito, transporte público, señalización vial y movilidad",
        "website_url": "https://www.sttdbuenaventura.gov.co",
        "contact_email": "contacto@sttdbuenaventura.gov.co",
        "phone": "+57 (2) 242-5000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Tránsito", "Transporte Público", "Señalización Vial", "Movilidad", "Accidentes de Tránsito"]
    },
    {
        "id": "educacion-buenaventura",
        "name": "Secretaría de Educación Buenaventura",
        "description": "Educación pública, colegios, infraestructura educativa y programas académicos",
        "website_url": "https://www.sembuenaventura.gov.co",
        "contact_email": "educacion@buenaventura.gov.co",
        "phone": "+57 (2) 242-4300",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Educación", "Colegios", "Infraestructura Educativa", "Programas Académicos"]
    },
    {
        "id": "epa-buenaventura",
        "name": "Establecimiento Público Ambiental (EPA) Buenaventura",
        "description": "Protección ambiental, recursos naturales, control de contaminación y gestión ambiental",
        "website_url": "https://www.epabuenaventura.gov.co",
        "contact_email": "contacto@epabuenaventura.gov.co",
        "phone": "+57 (2) 242-6000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Medio Ambiente", "Contaminación", "Recursos Naturales", "Ruido", "Gestión Ambiental"]
    },
    {
        "id": "contraloria-buenaventura",
        "name": "Contraloría Distrital Buenaventura",
        "description": "Control fiscal, vigilancia de recursos públicos y atención ciudadana",
        "website_url": "https://www.contraloriabuenaventura.gov.co",
        "contact_email": "contacto@contraloriabuenaventura.gov.co",
        "phone": "+57 (2) 242-7000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Control Fiscal", "Recursos Públicos", "Denuncias de Corrupción", "Transparencia"]
    },
    {
        "id": "personeria-buenaventura",
        "name": "Personería Distrital de Buenaventura",
        "description": "Defensa de derechos humanos, atención de quejas y protección ciudadana",
        "website_url": "https://personeriabuenaventura.gov.co",
        "contact_email": "personeria@buenaventura.gov.co",
        "phone": "+57 (2) 242-8000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Derechos Humanos", "Quejas Ciudadanas", "Protección Ciudadana", "Defensoría"]
    },
    {
        "id": "camara-comercio-buenaventura",
        "name": "Cámara de Comercio de Buenaventura",
        "description": "Registro mercantil, apoyo empresarial y desarrollo económico",
        "website_url": "https://www.ccbun.org",
        "contact_email": "info@ccbun.org",
        "phone": "+57 (2) 243-0000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Comercio", "Empresas", "Registro Mercantil", "Desarrollo Económico"]
    },
    {
        "id": "terminal-buenaventura",
        "name": "Terminal de Transporte Buenaventura",
        "description": "Terminal de buses, transporte intermunicipal y servicios de terminal",
        "website_url": "https://www.terminalbuenaventura.gov.co",
        "contact_email": "contacto@terminalbuenaventura.gov.co",
        "phone": "+57 (2) 243-1000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Transporte Intermunicipal", "Terminal de Buses", "Servicios de Terminal"]
    },
    {
        "id": "inpec-buenaventura",
        "name": "INPEC - EPMSC Buenaventura",
        "description": "Instituto Nacional Penitenciario y Carcelario, atención a reclusos",
        "website_url": "https://www.inpec.gov.co/epmsc-buenaventura",
        "contact_email": "buenaventura@inpec.gov.co",
        "phone": "+57 (2) 243-2000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Sistema Penitenciario", "Atención a Reclusos", "Justicia"]
    },
    {
        "id": "curaduria-buenaventura",
        "name": "Curaduría Urbana 2 Buenaventura",
        "description": "Licencias de construcción, permisos urbanísticos y control urbano",
        "website_url": "https://curaduria2buenaventura.com",
        "contact_email": "contacto@curaduria2buenaventura.com",
        "phone": "+57 (2) 243-3000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Construcción", "Licencias Urbanísticas", "Permisos de Construcción", "Control Urbano"]
    },
    {
        "id": "icbf-buenaventura",
        "name": "ICBF - Centro Zonal Buenaventura",
        "description": "Protección de niños, niñas y adolescentes, bienestar familiar",
        "website_url": "https://www.icbf.gov.co/puntos-atencion/centro-zonal-buenaventura",
        "contact_email": "buenaventura@icbf.gov.co",
        "phone": "+57 (2) 243-4000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Protección Infantil", "Bienestar Familiar", "Derechos de Niños", "Familia"]
    },
    {
        "id": "bomberos-buenaventura",
        "name": "Bomberos Voluntarios de Buenaventura",
        "description": "Atención de emergencias, incendios, rescates y prevención",
        "website_url": "https://bomberosbuenaventura.com.co",
        "contact_email": "bomberos@buenaventura.gov.co",
        "phone": "119 (Emergencias)",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Emergencias", "Incendios", "Rescates", "Prevención", "Desastres"]
    },
    {
        "id": "salud-buenaventura",
        "name": "Secretaría de Salud de Buenaventura",
        "description": "Salud pública, saneamiento ambiental y control sanitario",
        "website_url": "https://www.buenaventura.gov.co/secretarias/salud",
        "contact_email": "salud@buenaventura.gov.co",
        "phone": "+57 (2) 242-4100",
        "address": "Alcaldía Municipal, Carrera 3 # 2-08",
        "categories": ["Salud Pública", "Saneamiento", "Control Sanitario", "Vectores"]
    },
    {
        "id": "coosalud-buenaventura",
        "name": "Coosalud EPS - Oficina Buenaventura",
        "description": "Servicios de salud, EPS, atención médica y afiliaciones",
        "website_url": "https://coosalud.com/oficinas/buenaventura",
        "contact_email": "buenaventura@coosalud.com",
        "phone": "+57 (2) 243-5000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Salud", "EPS", "Atención Médica", "Afiliaciones"]
    },
    {
        "id": "sos-salud-buenaventura",
        "name": "SOS Salud - Valle del Cauca",
        "description": "Servicios de salud, urgencias y atención médica",
        "website_url": "https://www.sos.com.co/valle-del-cauca",
        "contact_email": "valle@sos.com.co",
        "phone": "+57 (2) 243-6000",
        "address": "Valle del Cauca (incluye Buenaventura)",
        "categories": ["Salud", "Urgencias", "Atención Médica", "Hospital"]
    },
    {
        "id": "tecnisalud-buenaventura",
        "name": "Tecnisalud Ceprodent - Sede Buenaventura",
        "description": "Servicios odontológicos y atención en salud oral",
        "website_url": "https://tecnisalud.edu.co",
        "contact_email": "contacto@tecnisalud.edu.co",
        "phone": "+57 (2) 243-7000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Salud Oral", "Odontología", "Atención Dental"]
    },
    {
        "id": "buenaventura-salud",
        "name": "Buenaventura Salud",
        "description": "Centro de salud con múltiples especialidades médicas",
        "website_url": "https://buenaventurasalud.com",
        "contact_email": "info@buenaventurasalud.com",
        "phone": "+57 (2) 243-8000",
        "address": "Buenaventura, Valle del Cauca",
        "categories": ["Salud", "Especialidades Médicas", "Consultas", "Agendamiento"]
    }
]

# === UTILITY FUNCTIONS ===
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")

async def verify_google_token(token: str):
    try:
        # Verify the Google token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return {
            'email': idinfo['email'],
            'name': idinfo['name'],
            'google_id': idinfo['sub']
        }
    except ValueError as e:
        logging.error(f"Google token verification failed: {e}")
        return None

def find_responsible_entity(title: str, description: str) -> dict:
    """Find the responsible entity based on problem description"""
    text_combined = (title + " " + description).lower()
    
    # Define keywords for each category
    category_keywords = {
        "Alumbrado Público": ["luz", "alumbrado", "poste", "luminaria", "lámpara", "bombillo", "iluminación"],
        "Vías y Calles": ["hueco", "vía", "calle", "carrera", "pavimento", "asfalto", "bache", "carretera", "andén"],
        "Recolección de Basuras": ["basura", "residuos", "recolección", "desechos", "limpieza", "barrido", "contenedor"],
        "Agua Potable": ["agua", "acueducto", "tubería", "fuga", "presión", "suministro", "grifo", "llave"],
        "Alcantarillado": ["alcantarillado", "desagüe", "cloaca", "aguas negras", "drenaje", "sumidero"],
        "Seguridad": ["seguridad", "robo", "delincuencia", "violencia", "inseguridad", "atraco", "hurto"],
        "Salud Pública": ["salud", "hospital", "centro de salud", "enfermedad", "epidemia", "vacuna"],
        "Medio Ambiente": ["contaminación", "ruido", "aire", "ambiente", "árbol", "parque", "verde"],
    }
    
    # Find best matching category
    best_category = "Otros"
    max_matches = 0
    
    for category, keywords in category_keywords.items():
        matches = sum(1 for keyword in keywords if keyword in text_combined)
        if matches > max_matches:
            max_matches = matches
            best_category = category
    
    # Find the entity responsible for this category
    for entity in ENTITIES_DATABASE:
        if best_category in entity["categories"]:
            return {
                "category": best_category,
                "entity": entity
            }
    
    # Default to Alcaldía if no specific match
    return {
        "category": "Otros",
        "entity": ENTITIES_DATABASE[0]  # Alcaldía as default
    }

async def classify_complaint_with_ai(title: str, description: str) -> dict:
    """Classify complaint using ChatGPT with entity database"""
    if not EMERGENT_LLM_KEY:
        # Fallback to basic classification
        return find_responsible_entity(title, description)
    
    try:
        headers = {
            "Authorization": f"Bearer {EMERGENT_LLM_KEY}",
            "Content-Type": "application/json"
        }
        
        # Create entities description for AI
        entities_text = "\n".join([
            f"- {entity['name']}: {', '.join(entity['categories'])} (Web: {entity['website_url']})"
            for entity in ENTITIES_DATABASE
        ])
        
        prompt = f"""Analiza la siguiente queja ciudadana de Buenaventura y clasifícala según las entidades competentes:

ENTIDADES DISPONIBLES:
{entities_text}

QUEJA:
Título: {title}
Descripción: {description}

Responde ÚNICAMENTE en formato JSON con esta estructura:
{{"category": "categoria_mas_apropiada", "entity_id": "id_de_la_entidad"}}

Usa los IDs: alcaldia-buenaventura, infraestructura-buenaventura, servicios-publicos-buenaventura, policia-buenaventura, transito-buenaventura, educacion-buenaventura, epa-buenaventura, contraloria-buenaventura, personeria-buenaventura, camara-comercio-buenaventura, terminal-buenaventura, inpec-buenaventura, curaduria-buenaventura, icbf-buenaventura, bomberos-buenaventura, salud-buenaventura, coosalud-buenaventura, sos-salud-buenaventura, tecnisalud-buenaventura, buenaventura-salud"""

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
                
                # Try to parse JSON response
                import json
                try:
                    classification = json.loads(content)
                    entity_id = classification.get("entity_id", "alcaldia-buenaventura")
                    
                    # Find the entity
                    entity = next((e for e in ENTITIES_DATABASE if e["id"] == entity_id), ENTITIES_DATABASE[0])
                    
                    return {
                        "category": classification.get("category", "Otros"),
                        "entity": entity
                    }
                except json.JSONDecodeError:
                    pass
    
    except Exception as e:
        logging.error(f"Error in AI classification: {e}")
    
    # Fallback to basic classification
    return find_responsible_entity(title, description)

async def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# === AUTHENTICATION ROUTES ===
@api_router.post("/auth/register", response_model=Token)
async def register(user_create: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_create.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    hashed_password = get_password_hash(user_create.password)
    user_dict = user_create.dict()
    del user_dict["password"]
    user_dict["hashed_password"] = hashed_password
    user_dict["auth_provider"] = "local"
    user_count = await db.users.count_documents({})
    user_dict["is_admin"] = (user_count == 0)
    
    user = User(**user_dict)
    await db.users.insert_one({**user.dict(), "hashed_password": hashed_password})
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_login: UserLogin):
    user_data = await db.users.find_one({"email": user_login.email})
    if not user_data or not verify_password(user_login.password, user_data.get("hashed_password", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    user = User(**user_data)
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.post("/auth/google", response_model=Token)
async def google_login(google_data: GoogleLoginData):
    # Verify Google token
    google_user_info = await verify_google_token(google_data.google_token)
    
    if not google_user_info:
        raise HTTPException(status_code=400, detail="Invalid Google token")
    
    # Check if user exists
    user_data = await db.users.find_one({"email": google_user_info['email']})
    
    if user_data:
        # User exists, log them in
        user = User(**user_data)
    else:
        # Create new user
        user_count = await db.users.count_documents({})
        user_dict = {
            "email": google_user_info['email'],
            "full_name": google_user_info['name'],
            "auth_provider": "google",
            "google_id": google_user_info['google_id'],
            "is_admin": (user_count == 0)
        }
        user = User(**user_dict)
        await db.users.insert_one({**user.dict(), "google_id": google_user_info['google_id']})
    
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, user=user)

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# === ENTITY ROUTES ===
@api_router.get("/entities", response_model=List[Entity])
async def get_entities():
    return [Entity(**entity) for entity in ENTITIES_DATABASE]

@api_router.get("/entities/{entity_id}", response_model=Entity)
async def get_entity(entity_id: str):
    entity = next((e for e in ENTITIES_DATABASE if e["id"] == entity_id), None)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    return Entity(**entity)

# === COMPLAINT ROUTES ===
@api_router.post("/complaints", response_model=Complaint)
async def create_complaint(complaint_create: ComplaintCreate, current_user: User = Depends(get_current_user)):
    # Classify the complaint and find responsible entity
    classification = await classify_complaint_with_ai(complaint_create.title, complaint_create.description)
    
    complaint_dict = complaint_create.dict()
    complaint_dict.update({
        "user_id": current_user.id,
        "user_email": current_user.email,
        "user_name": current_user.full_name,
        "user_phone": current_user.phone,
        "category_name": classification["category"],
        "responsible_entity": classification["entity"]["name"],
        "entity_info": classification["entity"],
        "comments": []
    })
    
    complaint = Complaint(**complaint_dict)
    await db.complaints.insert_one(complaint.dict())
    return complaint

@api_router.get("/complaints", response_model=List[Complaint])
async def get_complaints(current_user: User = Depends(get_current_user)):
    complaints = await db.complaints.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
    for complaint in complaints:
        comments = await db.comments.find({"complaint_id": complaint["id"]}).sort("created_at", 1).to_list(100)
        complaint["comments"] = [Comment(**comment) for comment in comments]
    return [Complaint(**complaint) for complaint in complaints]

@api_router.get("/complaints/all", response_model=List[Complaint])
async def get_all_complaints():
    complaints = await db.complaints.find().sort("created_at", -1).to_list(100)
    for complaint in complaints:
        comments = await db.comments.find({"complaint_id": complaint["id"]}).sort("created_at", 1).to_list(100)
        complaint["comments"] = [Comment(**comment) for comment in comments]
    return [Complaint(**complaint) for complaint in complaints]

@api_router.get("/complaints/{complaint_id}", response_model=Complaint)
async def get_complaint(complaint_id: str):
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    comments = await db.comments.find({"complaint_id": complaint_id}).sort("created_at", 1).to_list(100)
    complaint["comments"] = [Comment(**comment) for comment in comments]
    return Complaint(**complaint)

@api_router.put("/complaints/{complaint_id}/status")
async def update_complaint_status(complaint_id: str, complaint_update: ComplaintUpdate):
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {"status": complaint_update.status, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Status updated successfully"}

@api_router.put("/complaints/{complaint_id}/rating")
async def rate_complaint(complaint_id: str, rating: ComplaintRating, current_user: User = Depends(get_current_user)):
    result = await db.complaints.update_one(
        {"id": complaint_id, "user_id": current_user.id},
        {"$set": {"rating": rating.rating, "rating_comment": rating.comment, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Rating submitted successfully"}

@api_router.put("/complaints/{complaint_id}/redirect")
async def mark_complaint_redirected(complaint_id: str):
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {"redirected_to_entity": True, "updated_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Complaint marked as redirected"}

@api_router.post("/complaints/{complaint_id}/comments", response_model=Comment)
async def add_comment(complaint_id: str, comment_create: CommentCreate, current_user: User = Depends(get_current_user)):
    # Verify complaint exists
    complaint = await db.complaints.find_one({"id": complaint_id})
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    comment_dict = comment_create.dict()
    comment_dict.update({
        "complaint_id": complaint_id,
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "user_email": current_user.email
    })
    
    comment = Comment(**comment_dict)
    await db.comments.insert_one(comment.dict())
    return comment

@api_router.get("/complaints/{complaint_id}/comments", response_model=List[Comment])
async def get_comments(complaint_id: str):
    comments = await db.comments.find({"complaint_id": complaint_id}).sort("created_at", 1).to_list(100)
    return [Comment(**comment) for comment in comments]

@api_router.delete("/comments/{comment_id}")
async def delete_comment(comment_id: str, admin: User = Depends(get_current_admin)):
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}

# === ADMIN ROUTES ===
@api_router.get("/admin/complaints", response_model=List[Complaint])
async def admin_get_all_complaints(admin: User = Depends(get_current_admin)):
    complaints = await db.complaints.find().sort("created_at", -1).to_list(1000)
    for complaint in complaints:
        comments = await db.comments.find({"complaint_id": complaint["id"]}).sort("created_at", 1).to_list(100)
        complaint["comments"] = [Comment(**comment) for comment in comments]
    return [Complaint(**complaint) for complaint in complaints]

@api_router.get("/admin/users", response_model=List[User])
async def admin_get_users(admin: User = Depends(get_current_admin)):
    users = await db.users.find().sort("created_at", -1).to_list(1000)
    return [User(**user) for user in users]

@api_router.delete("/admin/complaints/{complaint_id}")
async def admin_delete_complaint(complaint_id: str, admin: User = Depends(get_current_admin)):
    # Delete associated comments first
    await db.comments.delete_many({"complaint_id": complaint_id})
    result = await db.complaints.delete_one({"id": complaint_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Complaint deleted successfully"}

@api_router.delete("/admin/users/{user_id}")
async def admin_delete_user(user_id: str, admin: User = Depends(get_current_admin)):
    # Prevent self-deletion
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@api_router.post("/admin/entities", response_model=Entity)
async def admin_add_entity(entity: Entity, admin: User = Depends(get_current_admin)):
    # Store in database for persistence
    await db.entities.insert_one(entity.dict())
    return entity

@api_router.delete("/admin/entities/{entity_id}")
async def admin_delete_entity(entity_id: str, admin: User = Depends(get_current_admin)):
    result = await db.entities.delete_one({"id": entity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Entity not found")
    return {"message": "Entity deleted successfully"}

@api_router.put("/admin/complaints/{complaint_id}/entity")
async def admin_update_complaint_entity(
    complaint_id: str, 
    entity_id: str,
    admin: User = Depends(get_current_admin)
):
    # Find the entity
    entity = next((e for e in ENTITIES_DATABASE if e["id"] == entity_id), None)
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    
    result = await db.complaints.update_one(
        {"id": complaint_id},
        {"$set": {
            "responsible_entity": entity["name"],
            "entity_info": entity,
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return {"message": "Entity updated successfully"}

@api_router.get("/admin/stats/detailed", response_model=dict)
async def admin_get_detailed_stats(admin: User = Depends(get_current_admin)):
    # Get all complaints
    all_complaints = await db.complaints.find().to_list(10000)
    
    # Calculate metrics
    total = len(all_complaints)
    by_status = {}
    by_category = {}
    by_entity = {}
    ratings = []
    
    # Calculate average response time
    response_times = []
    for complaint in all_complaints:
        status = complaint.get("status", "recibido")
        by_status[status] = by_status.get(status, 0) + 1
        
        category = complaint.get("category_name")
        if category:
            by_category[category] = by_category.get(category, 0) + 1
        
        entity = complaint.get("responsible_entity")
        if entity:
            by_entity[entity] = by_entity.get(entity, 0) + 1
        
        rating = complaint.get("rating")
        if rating:
            ratings.append(rating)
        
        # Calculate response time if status changed
        if status != "recibido":
            created = complaint.get("created_at")
            updated = complaint.get("updated_at")
            if created and updated:
                if isinstance(created, str):
                    created = datetime.fromisoformat(created.replace('Z', '+00:00'))
                if isinstance(updated, str):
                    updated = datetime.fromisoformat(updated.replace('Z', '+00:00'))
                response_time = (updated - created).total_seconds() / 3600  # hours
                response_times.append(response_time)
    
    avg_rating = sum(ratings) / len(ratings) if ratings else None
    avg_response_time = sum(response_times) / len(response_times) if response_times else None
    
    return {
        "total_complaints": total,
        "by_status": by_status,
        "by_category": by_category,
        "by_entity": by_entity,
        "average_rating": avg_rating,
        "average_response_time_hours": avg_response_time,
        "total_users": await db.users.count_documents({}),
        "total_comments": await db.comments.count_documents({})
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "https://reportebuenaventura-frontend.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
