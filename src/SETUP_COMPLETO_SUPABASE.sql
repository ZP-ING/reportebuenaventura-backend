-- ============================================
-- SETUP COMPLETO DE REPORTEBUENAVENTURA
-- Ejecutar este script en SQL Editor de Supabase
-- Dashboard → SQL Editor → New Query
-- ============================================

-- ============================================
-- PASO 1: VERIFICAR QUE LAS TABLAS EXISTEN
-- ============================================

-- Si alguna tabla no existe, primero ejecuta las migraciones:
-- /supabase/migrations/001_initial_schema.sql

DO $$
BEGIN
    -- Verificar tablas requeridas
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        RAISE EXCEPTION 'Tabla profiles no existe. Ejecuta primero 001_initial_schema.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'entities') THEN
        RAISE EXCEPTION 'Tabla entities no existe. Ejecuta primero 001_initial_schema.sql';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'reports') THEN
        RAISE EXCEPTION 'Tabla reports no existe. Ejecuta primero 001_initial_schema.sql';
    END IF;
    
    RAISE NOTICE 'Todas las tablas existen. Continuando...';
END $$;

-- ============================================
-- PASO 2: INSERTAR ENTIDADES POR DEFECTO
-- ============================================

-- Limpiar entidades existentes (OPCIONAL - comenta si quieres mantener las existentes)
-- TRUNCATE entities CASCADE;

-- Insertar las 11 entidades de Buenaventura
INSERT INTO entities (name, description, category, contact_email, contact_phone, website, address, is_active)
VALUES
  (
    'Secretaría de Obras Públicas',
    'Encargada de la infraestructura vial, mantenimiento de vías, construcción de puentes y obras civiles en Buenaventura',
    'infraestructura',
    'obras@buenaventura.gov.co',
    '+57 300 123 4567',
    'https://www.buenaventura.gov.co/obras',
    'Calle 1 # 1-50, Centro, Buenaventura',
    true
  ),
  (
    'ACUAVALLE',
    'Empresa de acueducto, alcantarillado y aseo de Buenaventura. Responsable del suministro de agua potable y manejo de aguas residuales',
    'servicios-publicos',
    'info@acuavalle.gov.co',
    '+57 300 123 4568',
    'https://www.acuavalle.gov.co',
    'Carrera 2 # 3-40, Buenaventura',
    true
  ),
  (
    'Bomberos Buenaventura',
    'Cuerpo de Bomberos Voluntarios de Buenaventura. Atención de emergencias, incendios, rescates y primeros auxilios',
    'emergencias',
    'bomberos@buenaventura.gov.co',
    '119',
    'https://www.bomberos.buenaventura.gov.co',
    'Calle 5 # 2-30, Buenaventura',
    true
  ),
  (
    'Policía Nacional',
    'Policía Nacional de Colombia - Estación Buenaventura. Seguridad ciudadana, orden público y atención de delitos',
    'seguridad',
    'policia@buenaventura.gov.co',
    '123',
    'https://www.policia.gov.co',
    'Carrera 3 # 4-20, Centro, Buenaventura',
    true
  ),
  (
    'EMBUENAVENTURA',
    'Empresa Municipal de Buenaventura. Responsable del aseo, recolección de residuos sólidos y limpieza de espacios públicos',
    'servicios-publicos',
    'aseo@embuenaventura.gov.co',
    '+57 300 123 4569',
    'https://www.embuenaventura.gov.co',
    'Calle 2 # 5-10, Buenaventura',
    true
  ),
  (
    'Secretaría de Salud',
    'Secretaría de Salud Municipal. Servicios de salud pública, centros de salud, vacunación y programas de prevención',
    'salud',
    'salud@buenaventura.gov.co',
    '+57 300 123 4570',
    'https://www.buenaventura.gov.co/salud',
    'Carrera 4 # 6-30, Buenaventura',
    true
  ),
  (
    'Secretaría de Ambiente',
    'Secretaría de Ambiente y Desarrollo Sostenible. Gestión ambiental, recursos naturales, parques y zonas verdes',
    'ambiente',
    'ambiente@buenaventura.gov.co',
    '+57 300 123 4571',
    'https://www.buenaventura.gov.co/ambiente',
    'Calle 7 # 3-50, Buenaventura',
    true
  ),
  (
    'Secretaría de Tránsito',
    'Secretaría de Tránsito y Transporte Municipal. Control y regulación del tráfico vehicular, señalización y semaforización',
    'transito',
    'transito@buenaventura.gov.co',
    '+57 300 123 4572',
    'https://www.buenaventura.gov.co/transito',
    'Carrera 5 # 8-20, Buenaventura',
    true
  ),
  (
    'EMCALI Telecomunicaciones',
    'EMCALI Telecomunicaciones. Servicios de internet, telefonía y telecomunicaciones para Buenaventura',
    'servicios-publicos',
    'telecomunicaciones@emcali.gov.co',
    '+57 300 123 4573',
    'https://www.emcali.com.co',
    'Calle 9 # 6-40, Buenaventura',
    true
  ),
  (
    'Defensa Civil',
    'Defensa Civil Colombiana - Seccional Buenaventura. Atención de desastres naturales, emergencias y gestión del riesgo',
    'emergencias',
    'defensacivil@buenaventura.gov.co',
    '144',
    'https://www.defensacivil.gov.co',
    'Carrera 7 # 10-30, Buenaventura',
    true
  ),
  (
    'Cruz Roja Colombiana',
    'Cruz Roja Colombiana - Seccional Buenaventura. Atención de emergencias médicas, primeros auxilios y servicios humanitarios',
    'emergencias',
    'cruzroja@buenaventura.gov.co',
    '132',
    'https://www.cruzrojacolombiana.org',
    'Calle 11 # 8-50, Buenaventura',
    true
  )
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  website = EXCLUDED.website,
  address = EXCLUDED.address,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Verificar inserción
SELECT 
  COUNT(*) as "Total Entidades",
  COUNT(*) FILTER (WHERE is_active = true) as "Entidades Activas"
FROM entities;

-- Mostrar todas las entidades
SELECT 
  id,
  name as "Nombre",
  category as "Categoría",
  contact_email as "Email",
  contact_phone as "Teléfono"
FROM entities
ORDER BY name;

-- ============================================
-- PASO 3: VERIFICAR/ACTUALIZAR ADMIN
-- ============================================

-- IMPORTANTE: Primero debes crear el usuario admin manualmente desde:
-- Dashboard → Authentication → Users → Add User
-- Email: admin@buenaventura.gov.co
-- Password: admin123
-- ✅ Confirmar email automáticamente

-- DESPUÉS de crear el usuario en Authentication, ejecutar esto:

-- Actualizar perfil a admin
UPDATE profiles
SET 
  role = 'admin',
  name = 'Administrador Sistema',
  updated_at = NOW()
WHERE email = 'admin@buenaventura.gov.co';

-- Si el perfil no existe, lo creamos (esto puede fallar si el trigger no lo creó)
-- Solo ejecutar si el UPDATE de arriba retorna 0 rows
/*
INSERT INTO profiles (id, email, name, role)
SELECT 
  id,
  email,
  'Administrador Sistema',
  'admin'::user_role
FROM auth.users
WHERE email = 'admin@buenaventura.gov.co'
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  name = 'Administrador Sistema',
  updated_at = NOW();
*/

-- Verificar admin
SELECT 
  p.id,
  p.email,
  p.name,
  p.role,
  p.created_at,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ Usuario Auth existe'
    ELSE '❌ Usuario Auth NO existe'
  END as "Estado Auth"
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'admin@buenaventura.gov.co';

-- ============================================
-- PASO 4: ESTADÍSTICAS Y VERIFICACIÓN FINAL
-- ============================================

-- Resumen de la base de datos
SELECT 
  'Perfiles' as tabla, COUNT(*) as registros FROM profiles
UNION ALL
SELECT 'Entidades', COUNT(*) FROM entities
UNION ALL
SELECT 'Reportes', COUNT(*) FROM reports
UNION ALL
SELECT 'Comentarios', COUNT(*) FROM comments
UNION ALL
SELECT 'Calificaciones', COUNT(*) FROM ratings
ORDER BY tabla;

-- Verificar entidades por categoría
SELECT 
  category as "Categoría",
  COUNT(*) as "Cantidad",
  STRING_AGG(name, ', ' ORDER BY name) as "Entidades"
FROM entities
WHERE is_active = true
GROUP BY category
ORDER BY category;

-- ============================================
-- INFORMACIÓN IMPORTANTE
-- ============================================

/*
✅ SETUP COMPLETADO

Pasos siguientes:

1. CREAR USUARIO ADMIN (si no existe):
   - Dashboard → Authentication → Users → Add User
   - Email: admin@buenaventura.gov.co
   - Password: admin123
   - ✅ Confirmar email automáticamente

2. DESPLEGAR EDGE FUNCTION:
   - Dashboard → Edge Functions → make-server-e2de53ff
   - Copiar contenido completo de /supabase/functions/server/index.tsx
   - Deploy

3. VERIFICAR FUNCIONAMIENTO:
   - Iniciar sesión como admin@buenaventura.gov.co
   - Verificar que el dashboard carga sin errores 401
   - Crear un reporte de prueba
   - Verificar que aparece en la tabla reports

4. SI HAY ERRORES 401:
   - Verifica que el Edge Function esté desplegado
   - Revisa los logs del Edge Function en el Dashboard
   - Verifica que el token se esté guardando correctamente:
     localStorage.getItem('accessToken')

CONSULTAS ÚTILES:

-- Ver todos los reportes
SELECT id, title, entity_name, status, created_at 
FROM reports 
ORDER BY created_at DESC 
LIMIT 10;

-- Ver todos los usuarios
SELECT id, email, name, role 
FROM profiles 
ORDER BY created_at DESC;

-- Ver comentarios
SELECT c.text, c.created_at, p.name as usuario, r.title as reporte
FROM comments c
JOIN profiles p ON c.user_id = p.id
JOIN reports r ON c.report_id = r.id
ORDER BY c.created_at DESC
LIMIT 10;

-- Ver calificaciones
SELECT r.title, rt.rating, rt.comment, p.name as usuario
FROM ratings rt
JOIN reports r ON rt.report_id = r.id
JOIN profiles p ON rt.user_id = p.id
ORDER BY rt.created_at DESC;

© 2025 ZPservicioTecnico
*/
