"""
Script para verificar la configuración del deployment
Ejecutar: python verify_deployment.py
"""

import os
import sys
from dotenv import load_dotenv

load_dotenv()

def check_env_var(var_name, required=True):
    value = os.environ.get(var_name)
    if value:
        # Ocultar valores sensibles
        if 'KEY' in var_name or 'PASSWORD' in var_name or 'SECRET' in var_name:
            display_value = value[:10] + '...' if len(value) > 10 else '***'
        else:
            display_value = value
        print(f"✓ {var_name}: {display_value}")
        return True
    else:
        if required:
            print(f"✗ {var_name}: FALTANTE (REQUERIDO)")
            return False
        else:
            print(f"⚠ {var_name}: FALTANTE (OPCIONAL)")
            return True

def main():
    print("=" * 60)
    print("Verificación de Configuración - ReporteBuenaventura Backend")
    print("=" * 60)
    print()
    
    all_ok = True
    
    print("Variables de Entorno Requeridas:")
    print("-" * 60)
    all_ok &= check_env_var('MONGO_URL', required=True)
    all_ok &= check_env_var('DB_NAME', required=True)
    all_ok &= check_env_var('JWT_SECRET_KEY', required=True)
    all_ok &= check_env_var('CORS_ORIGINS', required=True)
    
    print()
    print("Variables de Entorno Opcionales:")
    print("-" * 60)
    check_env_var('EMERGENT_LLM_KEY', required=False)
    check_env_var('GOOGLE_CLIENT_ID', required=False)
    
    print()
    print("=" * 60)
    
    if all_ok:
        print("✓ Todas las variables requeridas están configuradas")
        print()
        print("Próximos pasos:")
        print("1. Verifica que CORS_ORIGINS incluya tu URL de Vercel")
        print("2. Verifica que MongoDB Atlas permita conexiones (0.0.0.0/0)")
        print("3. Despliega en Railway")
        print("4. Configura REACT_APP_BACKEND_URL en Vercel con tu URL de Railway")
        return 0
    else:
        print("✗ Faltan variables de entorno requeridas")
        print()
        print("Crea un archivo .env con las variables faltantes")
        print("O configúralas en Railway antes de desplegar")
        return 1

if __name__ == "__main__":
    sys.exit(main())
