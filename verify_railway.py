"""
Script de verificación para Railway
Ejecuta esto en Railway para verificar que todo esté configurado correctamente

Cómo usar:
1. Ve a Railway → tu proyecto backend
2. Abre la terminal (si está disponible) o revisa los logs
3. Este script se ejecutará automáticamente si lo agregas al startup
"""

import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

def check_env_var(name, required=True):
    """Verifica que una variable de entorno exista"""
    value = os.environ.get(name)
    if value:
        # Ocultar valores sensibles
        if 'KEY' in name or 'SECRET' in name or 'PASSWORD' in name:
            display_value = value[:10] + '...' if len(value) > 10 else '***'
        else:
            display_value = value[:50] + '...' if len(value) > 50 else value
        print(f" {name}: {display_value}")
        return True
    else:
        if required:
            print(f"✗ {name}: NO CONFIGURADA (REQUERIDA)")
        else:
            print(f"✗ {name}: NO CONFIGURADA (OPCIONAL)")
        return not required

async def check_mongodb():
    """Verifica la conexión a MongoDB"""
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    if not mongo_url or not db_name:
        print(" No se puede verificar MongoDB: faltan MONGO_URL o DB_NAME")
        return False
    
    try:
        print(f"\n Conectando a MongoDB...")
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
        db = client[db_name]
        
        # Probar conexión
        await client.server_info()
        print(f" Conexión a MongoDB exitosa!")
        
        # Contar documentos
        users_count = await db.users.count_documents({})
        complaints_count = await db.complaints.count_documents({})
        
        print(f" Base de datos: {db_name}")
        print(f"   - Usuarios: {users_count}")
        print(f"   - Reportes: {complaints_count}")
        
        client.close()
        return True
    except Exception as e:
        print(f" Error conectando a MongoDB: {e}")
        return False

def check_cors():
    """Verifica la configuración de CORS"""
    cors_origins = os.environ.get('CORS_ORIGINS', '*')
    print(f"\n Configuración CORS:")
    
    if cors_origins == '*':
        print(f"  CORS permite TODOS los orígenes (no recomendado en producción)")
        print(f"   Valor actual: {cors_origins}")
        print(f"   Recomendado: https://reportebuenaventura-frontend.vercel.app,http://localhost:3000")
        return False
    else:
        origins = cors_origins.split(',')
        print(f" CORS configurado con {len(origins)} origen(es):")
        for origin in origins:
            print(f"   - {origin.strip()}")
        
        # Verificar que incluya el frontend de Vercel
        if 'reportebuenaventura-frontend.vercel.app' in cors_origins:
            print(f" Frontend de Vercel incluido en CORS")
            return True
        else:
            print(f" ✗ Frontend de Vercel NO incluido en CORS")
            print(f"   Agrega: https://reportebuenaventura-frontend.vercel.app")
            return False

async def main():
    print("=" * 70)
    print(" VERIFICACIÓN DE CONFIGURACIÓN - RAILWAY BACKEND")
    print("=" * 70)
    
    print("\n Variables de Entorno:")
    print("-" * 70)
    
    all_ok = True
    
    # Variables requeridas
    all_ok &= check_env_var('MONGO_URL', required=True)
    all_ok &= check_env_var('DB_NAME', required=True)
    all_ok &= check_env_var('JWT_SECRET_KEY', required=True)
    
    # Variables opcionales pero recomendadas
    check_env_var('CORS_ORIGINS', required=False)
    check_env_var('GOOGLE_CLIENT_ID', required=False)
    check_env_var('EMERGENT_LLM_KEY', required=False)
    
    # Verificar CORS
    print("-" * 70)
    cors_ok = check_cors()
    
    # Verificar MongoDB
    print("-" * 70)
    mongo_ok = await check_mongodb()
    
    # Resumen
    print("\n" + "=" * 70)
    print(" RESUMEN")
    print("=" * 70)
    
    if all_ok and mongo_ok and cors_ok:
        print(" Todas las verificaciones pasaron!")
        print(" El backend está correctamente configurado")
        return 0
    else:
        print("  Algunas verificaciones fallaron:")
        if not all_ok:
            print("   - Faltan variables de entorno requeridas")
        if not mongo_ok:
            print("   - Problemas con la conexión a MongoDB")
        if not cors_ok:
            print("   - CORS no está configurado correctamente")
        print("\n Revisa los mensajes arriba para más detalles")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
