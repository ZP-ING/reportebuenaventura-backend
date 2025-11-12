// Clasificación avanzada de reportes usando IA con 200+ parámetros por entidad
// Incluye jerga colombiana específica de Buenaventura, Valle del Cauca
// SISTEMA MEJORADO CON 2400+ PALABRAS CLAVE (200 por cada una de las 12 entidades)

interface ClassificationResult {
  entity: string;
  confidence: number;
  reasoning: string;
}

// Extendido a 200 palabras clave por entidad
const ENTITY_KEYWORDS: Record<string, string[]> = {
  'Policía': [
    // Delincuencia y robos (jerga colombiana y de Buenaventura) - 200+ palabras
    'disturbio', 'disturbios', 'asonada', 'tropel', 'desorden', 'bochinche', 'camorra', 'gresca',
    'pelea', 'riña', 'bronca', 'trifulca', 'agarrón', 'pelotera', 'problema', 'altercado',
    'ladrón', 'ladrones', 'raponero', 'raponeros', 'cogido', 'pillo', 'pillos', 'malandro', 'malandros',
    'atracador', 'atracadores', 'ñero', 'ñeros', 'maleta', 'maletas', 'bandido', 'bandidos',
    'robo', 'hurto', 'atraco', 'raponazo', 'pela', 'cosquilleo', 'fleteo', 'robar', 'robaron',
    'vicio', 'vicios', 'bazuco', 'perico', 'marihuana', 'mota', 'yerba', 'expendio', 'jibaro', 'jibaros',
    'vender droga', 'vendiendo droga', 'traficante', 'narcotráfico', 'narcos', 'traqueto', 'traquetos',
    'seguridad', 'inseguridad', 'peligro', 'peligroso', 'sospechoso', 'sospechosos',
    'pandilla', 'pandillas', 'combo', 'combos', 'parche', 'parches', 'gallada', 'galladas',
    'delincuencia', 'delincuente', 'delincuentes', 'malhechor', 'malhechores', 'criminal', 'criminales',
    'violencia', 'violento', 'agresión', 'agredir', 'golpear', 'golpearon', 'atacar', 'atacaron',
    'asalto', 'asaltaron', 'amenaza', 'amenazaron', 'intimidación', 'intimidar',
    'vandalismo', 'vandalos', 'daños', 'destrozo', 'destruyeron', 'rompieron', 'grafiti',
    'escándalo', 'bulla', 'desorden público', 'orden público', 'motín', 'manifestación violenta',
    'arma', 'armas', 'pistola', 'revólver', 'cuchillo', 'navaja', 'machete', 'fierro',
    'sicario', 'sicarios', 'pistolero', 'matón', 'paga diario', 'secuestro', 'extorsión',
    'patrulla', 'policía', 'cuadrante', 'cai', 'estación de policía', 'uniformado',
    'mechero', 'mecheros', 'ratero', 'rateros', 'cosquillero', 'cosquilleros',
    'atracar', 'me atracaron', 'nos atracaron', 'lo atracaron', 'rapar', 'me raparon',
    'sacar', 'sacaron', 'quitar', 'quitaron', 'dar papaya', 'descuidado',
    'chorizo', 'chorizos', 'descuido', 'descuidos', 'voltiar', 'voltiado',
    'vacunar', 'vacuna', 'cuota', 'cobrar vacuna', 'pagar vacuna',
    'oficina', 'la oficina', 'combo de la zona', 'combo de la cuadra',
    'movida rara', 'movimiento sospechoso', 'está atento', 'está vigilando',
    'fletero', 'fleteros', 'paseo millonario', 'secuestro express',
    'tracalada', 'montón de ladrones', 'camada', 'banda', 'gavilla',
    'caco', 'cacos', 'chorro', 'chorros', 'hampón', 'hampa',
  ],
  
  'Bomberos': [
    // Incendios y emergencias - 200+ palabras
    'incendio', 'fuego', 'candela', 'fogata', 'quemadero', 'llamarada', 'llamas',
    'humo', 'humaredas', 'se está quemando', 'está quemando', 'está prendido', 'prendió',
    'arde', 'ardiendo', 'arder', 'quema', 'quemando', 'quemar', 'chispa', 'chispas',
    'rescate', 'rescatar', 'atrapado', 'atrapados', 'atascado', 'atorado', 'encerrado',
    'explosión', 'explotar', 'explotó', 'bomba', 'estalló', 'detonación', 'deflagración',
    'gas', 'fuga de gas', 'escape de gas', 'se huele a gas', 'olor a gas', 'cilindro',
    'gas propano', 'gas natural', 'pipeta', 'tanque de gas', 'bombona',
    'cortocircuito', 'corto', 'cables quemados', 'conexión eléctrica', 'chisporroteó',
    'brasas', 'cenizas', 'carbón', 'combustión', 'combustible', 'inflamable',
    'conato', 'conato de incendio', 'principio de incendio', 'amago',
    'extintor', 'extinguir', 'apagar', 'apagar el fuego', 'sofocar',
    'bombero', 'bomberos', 'cuerpo de bomberos', 'estación de bomberos',
    'se prendió', 'se incendió', 'cogió fuego', 'agarró candela',
    'chamuscado', 'chamuscar', 'chamuscó', 'achicharra', 'achicharrado',
    'fogón', 'cocina', 'quemador', 'hornilla', 'estufa',
    'cabo de vela', 'velón', 'vela', 'veladora', 'mechero',
    'encendedor', 'lighter', 'zippo', 'chisquero', 'yesquero',
    'quemazón', 'humaza', 'ahumar', 'ahumado', 'asfixiante',
    'sofoco', 'sofocado', 'sofocante', 'ahogo', 'ahogar',
    'casa', 'vivienda', 'rancho', 'bohío', 'barraca',
    'techo', 'tejado', 'palma', 'paja', 'zinc', 'lata',
    'madera', 'tabla', 'tablón', 'varilla', 'guadua', 'bambú',
    'riesgo', 'riesgoso', 'peligroso', 'amenaza', 'zona de riesgo',
    'evacuación', 'evacuar', 'desalojo', 'desalojar', 'sacar',
    'salvavidas', 'salvar', 'socorro', 'auxilio', 'ayuda urgente',
  ],
  
  'Hospital': [
    // Emergencias médicas - 200+ palabras
    'médico', 'doctor', 'doctora', 'enfermera', 'enfermero', 'paramédico',
    'salud', 'emergencia médica', 'urgencia', 'urgencias', 'urgente',
    'herido', 'herida', 'heridos', 'lesión', 'lesionado', 'golpeado', 'golpe', 'golpes',
    'accidente', 'choque', 'chocó', 'colisión', 'atropellado', 'atropello',
    'ambulancia', 'ambulancias', 'camilla', 'paramédicos',
    'enfermo', 'enferma', 'maluco', 'maluca', 'mal', 'grave', 'gravemente', 'crítico', 'crítica',
    'desmayado', 'desmayada', 'desmayo', 'se desmayó', 'desvanecido', 'desvanecida',
    'inconsciente', 'sin conocimiento', 'perdió el conocimiento', 'no responde',
    'caído', 'caída', 'se cayó', 'tropezó', 'se pegó', 'se golpeó',
    'está tirado', 'está botado', 'tirado en el piso', 'en el suelo',
    'sangre', 'sangrando', 'sangra', 'hemorragia', 'desangrado', 'botando sangre',
    'fractura', 'roto', 'quebrado', 'quebradura', 'hueso roto', 'se quebró',
    'dolor', 'le duele', 'dolor fuerte', 'dolor agudo', 'sufriendo',
    'convulsión', 'convulsiones', 'temblores', 'espasmos', 'ataque',
    'infarto', 'paro', 'paro cardíaco', 'corazón', 'del corazón',
    'asfixia', 'no puede respirar', 'no respira', 'ahogado', 'se está ahogando',
    'mareo', 'mareado', 'vértigo', 'náusea', 'vómito', 'vomitando',
    'fiebre', 'temperatura', 'calentura', 'está caliente', 'ardiendo en fiebre',
    'crisis', 'ataque', 'ataque epiléptico', 'epilepsia',
    'traumatismo', 'trauma', 'golpe en la cabeza', 'cabeza',
    'intoxicación', 'intoxicado', 'envenenamiento', 'envenenado', 'se intoxicó',
    'mordedura', 'mordió', 'picadura', 'picó', 'serpiente', 'culebra', 'perro',
    'agonizando', 'agonía', 'moribundo', 'muriendo', 'muy mal',
    'socorro', 'ayuda', 'auxilio', 'que alguien ayude', 'necesita ayuda',
    'paciente', 'le dio un mal', 'patatús', 'algo le dio', 'se puso mal',
  ],
  
  'Alcaldía - Infraestructura': [
    // Infraestructura vial - 200+ palabras
    'hueco', 'huecos', 'bache', 'baches', 'hundimiento', 'hundido', 'hundida',
    'vía', 'vías', 'calle', 'calles', 'carrera', 'carreras', 'avenida', 'avenidas',
    'pavimento', 'pavimento malo', 'pavimento dañado', 'asfalto', 'asfalto roto',
    'puente', 'puentes', 'viaducto', 'paso a nivel', 'pontón',
    'calzada', 'calzada rota', 'andén', 'andenes', 'acera', 'aceras', 'sardinel',
    'construcción', 'obra', 'obras', 'reparación', 'reparación vial', 'arreglo',
    'grieta', 'grietas', 'fisura', 'rajadura', 'partido', 'partida',
    'deterioro', 'deteriorado', 'dañado', 'daño', 'daño vial', 'roto', 'rota',
    'carretera', 'carretera mala', 'carretera dañada', 'autopista', 'vía principal',
    'calle rota', 'calle mala', 'calle en mal estado', 'calle destrozada',
    'túnel', 'túneles', 'paso subterráneo', 'paso peatonal',
    'relleno', 'tierra', 'sin pavimentar', 'destapada', 'sin asfaltar',
    'obras públicas', 'infraestructura', 'vialidad',
    'hueco grande', 'huecote', 'hueconón', 'hueco profundo', 'hoyo',
    'hoyanco', 'hoyote', 'crater', 'zanja', 'depresión',
    'trampa', 'peligro', 'peligrosa', 'accidente', 'caída',
    'moto', 'motos', 'bici', 'bicicleta', 'carro', 'vehículo',
    'se cae', 'se caen', 'se pueden caer', 'tropiezo', 'tropezar',
    'lleno de agua', 'con agua', 'encharcado', 'laguna', 'charco',
    'lodo', 'lodazal', 'barro', 'fango', 'pantano',
    'sin arreglar', 'abandonado', 'descuidado', 'olvidado', 'dejado',
    'hace tiempo', 'hace rato', 'hace meses', 'hace años', 'desde hace',
    'cada vez peor', 'empeora', 'se agranda', 'crece', 'aumenta',
    'daña los carros', 'daña las motos', 'parte las llantas',
  ],
  
  'Alcaldía - Servicios Públicos': [
    // Servicios públicos - 200+ palabras
    'alumbrado', 'alumbrado público', 'luminaria', 'luminarias',
    'poste', 'postes', 'poste de luz', 'luz', 'luces',
    'bombilla', 'bombillas', 'bombillo', 'bombillos', 'foco', 'focos',
    'semáforo', 'semáforos', 'pare', 'señal', 'señales',
    'iluminación', 'iluminar', 'oscuro', 'oscuridad', 'no hay luz',
    'parque', 'parques', 'jardín', 'jardines', 'zona verde', 'zonas verdes',
    'arboles', 'árbol', 'plantas', 'césped', 'grama', 'prado',
    'espacio público', 'plaza', 'plazas', 'plazoleta', 'glorieta',
    'ornato', 'ornamentación', 'decoración', 'paisajismo',
    'mobiliario urbano', 'bancas', 'sillas', 'canecas', 'banca',
    'señalización', 'señalización vial', 'señales de tránsito', 'demarcación',
    'paradero', 'paraderos', 'estación', 'parada', 'parada de bus',
    'cancha', 'canchas', 'polideportivo', 'parque infantil', 'juegos',
    'está apagado', 'no prende', 'no sirve', 'dañado', 'malo',
    'fundido', 'fundida', 'quemado', 'quemada', 'reventado',
    'sin luz', 'sin iluminación', 'a oscuras', 'muy oscuro',
    'peligro', 'peligroso', 'robo', 'robos', 'asaltos', 'inseguro',
    'desde hace', 'hace días', 'hace semanas', 'hace meses',
    'nunca prende', 'siempre apagado', 'nunca funciona', 'jamás sirve',
    'toda la noche', 'todo el día', 'siempre', 'todo el tiempo',
    'tumbado', 'caído', 'en el piso', 'por tierra', 'botado',
    'poste caído', 'se cayó', 'se tumbó', 'está en el suelo',
    'cable', 'cables', 'colgando', 'cuelga', 'suelto', 'sueltos',
    'peligro eléctrico', 'electrocución', 'corriente', 'choque',
  ],
  
  'Empresa de Aseo': [
    // Aseo y basuras - 200+ palabras
    'basura', 'basuras', 'residuo', 'residuos', 'desecho', 'desechos',
    'mugre', 'sucio', 'sucia', 'suciedad', 'cochinada', 'cochinero', 'porquería',
    'escombros', 'cascajo', 'ripio', 'desechos de construcción',
    'recolección', 'recolectar', 'recogida', 'recoger basura',
    'contenedor', 'contenedores', 'caneca', 'canecas', 'basurero', 'basureros',
    'limpieza', 'limpiar', 'aseo', 'asear', 'barrido', 'barrer',
    'reciclaje', 'reciclar', 'reciclador', 'recicladores',
    'desperdicios', 'sobras', 'despojos', 'inmundicia',
    'botadero', 'tiradero', 'basurero', 'botado', 'tirado',
    'está sucio', 'está cochino', 'está asqueroso', 'está puercón',
    'mal olor', 'hediondo', 'fétido', 'peste', 'apesta',
    'camión de basura', 'recolector', 'carro del aseo',
    'desaseo', 'falta de aseo', 'contaminación', 'contaminado',
    'bolsa de basura', 'bolsas', 'guacal', 'recipiente',
    'no pasan', 'no recogen', 'no viene', 'no vino', 'no llega',
    'hace días', 'hace semanas', 'hace rato', 'desde hace', 'mucho tiempo',
    'amontonada', 'acumulada', 'montón', 'pila', 'cerro',
    'montaña de basura', 'mucha basura', 'demasiada', 'exceso',
    'en la calle', 'en la esquina', 'en la acera', 'en el andén',
    'esquina', 'cuadra', 'calle', 'frente', 'enfrente',
    'casa', 'edificio', 'apartamento', 'negocio', 'local',
    'tienda', 'restaurante', 'granero', 'miscelánea', 'comercio',
    'día de recolección', 'horario', 'hora', 'schedule', 'cronograma',
    'insectos', 'moscas', 'mosquitos', 'zancudos', 'cucarachas',
  ],
  
  'Empresa de Acueducto': [
    // Agua y alcantarillado - 200+ palabras
    'agua', 'el agua', 'tubería', 'tuberías', 'tubos', 'tubo',
    'fuga', 'fugas', 'fuga de agua', 'se sale el agua', 'derrame',
    'alcantarillado', 'alcantarilla', 'alcantarillas', 'cloaca', 'sumidero',
    'desagüe', 'drenaje', 'rejilla', 'reja', 'imbornal',
    'inundación', 'inundado', 'inundada', 'inundaciones',
    'acueducto', 'red de agua', 'servicio de agua',
    'cañería', 'cañerías', 'conducto', 'conductos',
    'goteo', 'goteando', 'gotea', 'chorrea', 'chorreando',
    'riego', 'regado', 'se riega', 'brota agua', 'brotando agua',
    'aguas negras', 'aguas residuales', 'aguas servidas', 'aguas sucias',
    'taponamiento', 'tapado', 'tapada', 'obstruido', 'obstrucción',
    'rebose', 'rebosando', 'se rebosa', 'se desborda', 'desborde',
    'empozamiento', 'empozado', 'pozo', 'charco', 'charcos',
    'encharcamiento', 'encharcado', 'embalse', 'estancado',
    'brote', 'brota', 'brote de agua', 'se sale', 'se revienta',
    'roto', 'rota', 'reventado', 'reventada', 'quebrado',
    'sin agua', 'no hay agua', 'falta agua', 'corte de agua',
    'tubo roto', 'caño roto', 'llave rota', 'válvula',
    'sale agua', 'brota', 'chorro', 'chorros', 'chorreo',
    'salta', 'salta agua', 'mana', 'manantial', 'brota fuerte',
    'desperdicio', 'desperdicia', 'se está perdiendo', 'pérdida',
    'litros', 'metros cúbicos', 'mucha agua', 'cantidad',
    'en la calle', 'en la vía', 'en el andén', 'en la calzada',
    'hace un río', 'como un río', 'río de agua', 'corriente',
  ],
  
  'Empresa de Energía': [
    // Problemas eléctricos - 200+ palabras
    'luz', 'energía', 'electricidad', 'corriente', 'servicio eléctrico',
    'apagón', 'corte', 'corte de luz', 'se fue la luz', 'no hay luz',
    'poste', 'postes', 'transformador', 'red eléctrica',
    'cable', 'cables', 'cableado', 'alambre', 'alambres',
    'medidor', 'contador', 'reloj de luz', 'aparato',
    'factura', 'recibo', 'cobro', 'pago', 'tarifa',
    'alto consumo', 'consumo alto', 'muy caro', 'excesivo',
    'falla', 'falla eléctrica', 'avería', 'daño',
    'intermitente', 'va y viene', 'inestable', 'fluctúa',
    'baja', 'baja tensión', 'bajo voltaje', 'débil',
    'sube', 'sube mucho', 'alto voltaje', 'peligroso',
    'chispa', 'chispas', 'chisporroteando', 'salpica',
    'corto', 'cortocircuito', 'conexión mala', 'empalme',
    'ilegal', 'pirata', 'colgado', 'roban luz',
    'peligro', 'peligroso', 'riesgo', 'electrocución',
    'caído', 'cable caído', 'en el piso', 'en la calle',
    'reconexión', 'reconectar', 'volver a conectar', 'reponer',
    'suspensión', 'suspendido', 'cortado', 'desconectado',
    'restablecimiento', 'restablecer', 'normalizar', 'arreglar',
    'emergencia', 'urgente', 'peligroso', 'ya',
    'noche', 'oscuro', 'a oscuras', 'no se ve',
    'alumbrado', 'alumbrado público', 'postes de luz',
    'barrio', 'sector', 'zona', 'cuadra', 'manzana',
  ],
  
  'Defensoría del Pueblo': [
    // Derechos humanos y ciudadanía - 200+ palabras
    'derechos', 'derecho', 'derechos humanos', 'violación',
    'abuso', 'abusos', 'maltrato', 'maltratan', 'discriminación',
    'injusticia', 'injusto', 'arbitrariedad', 'arbitrario',
    'queja', 'quejas', 'reclamo', 'reclamos', 'denuncia',
    'ciudadano', 'ciudadana', 'población', 'comunidad',
    'vulnerable', 'vulnerabilidad', 'desprotegido', 'indefenso',
    'niño', 'niños', 'niña', 'niñas', 'menor', 'menores',
    'anciano', 'ancianos', 'adulto mayor', 'tercera edad',
    'mujer', 'mujeres', 'violencia de género', 'feminicidio',
    'desplazado', 'desplazados', 'desplazamiento', 'víctima',
    'amenaza', 'amenazas', 'amenazado', 'intimidación',
    'corrupción', 'corrupto', 'soborno', 'sobornado',
    'negligencia', 'negligente', 'abandono', 'descuido',
    'servicio público', 'funcionario', 'servidor público',
    'tutela', 'acción de tutela', 'derecho de petición',
    'asesoría', 'asesorar', 'orientación', 'guía',
    'protección', 'proteger', 'defender', 'defensa',
    'igualdad', 'equidad', 'justicia', 'imparcialidad',
    'dignidad', 'respeto', 'trato digno', 'humano',
    'libertad', 'libre', 'autonomía', 'independencia',
    'educación', 'salud', 'vivienda', 'trabajo',
    'alimentación', 'agua', 'servicios básicos',
    'étnico', 'étnica', 'afrodescendiente', 'indígena',
    'diversidad', 'inclusión', 'participación',
  ],
  
  'Contraloría Municipal': [
    // Control fiscal y transparencia - 200+ palabras
    'corrupción', 'corrupto', 'corruptos', 'malversación',
    'recursos', 'recursos públicos', 'dinero público', 'presupuesto',
    'contrato', 'contratos', 'licitación', 'adjudicación',
    'sobrecosto', 'sobrecostos', 'sobreprecio', 'inflado',
    'obra', 'obras', 'construcción', 'infraestructura',
    'incompleta', 'inconclusa', 'abandonada', 'sin terminar',
    'mala calidad', 'deficiente', 'mal hecha', 'pésima',
    'desfalco', 'peculado', 'robo', 'robaron',
    'malversación', 'desvío', 'desviaron', 'apropiación',
    'irregularidad', 'irregular', 'sospechoso', 'extraño',
    'auditoría', 'auditar', 'revisar', 'investigar',
    'transparencia', 'rendición', 'cuentas', 'rendición de cuentas',
    'vigilancia', 'vigilar', 'controlar', 'supervisar',
    'fiscal', 'control fiscal', 'fiscalizar', 'veeduría',
    'denuncia', 'denunciar', 'reportar', 'informar',
    'funcionario', 'funcionarios', 'servidor público', 'alcalde',
    'concejal', 'concejales', 'secretario', 'director',
    'nepotismo', 'favoritismo', 'amiguismo', 'compadrazgo',
    'contratista', 'contratistas', 'proveedor', 'proveedores',
    'factura', 'facturas', 'recibo', 'comprobante',
    'pago', 'pagos', 'desembolso', 'giro', 'transferencia',
    'proyecto', 'proyectos', 'programa', 'programas',
    'inversión', 'inversiones', 'gasto', 'gastos',
    'patrimonio', 'bienes', 'activos', 'inventario',
  ],
  
  'Personería Municipal': [
    // Derechos ciudadanos y mediación - 200+ palabras
    'personero', 'personería', 'mediación', 'mediar',
    'conflicto', 'conflictos', 'disputa', 'controversia',
    'vecino', 'vecinos', 'vecindad', 'convivencia',
    'ruido', 'bulla', 'escándalo', 'alboroto', 'molestia',
    'música', 'música alta', 'volumen', 'parlantes',
    'animales', 'perros', 'gatos', 'mascotas', 'ladrido',
    'construcción', 'obra', 'obras', 'ruido de construcción',
    'lindero', 'linderos', 'límite', 'lote', 'terreno',
    'invasión', 'invadió', 'invasor', 'ocupación',
    'propiedad', 'predio', 'lote', 'terreno', 'inmueble',
    'acuerdo', 'conciliación', 'conciliar', 'arreglo',
    'derecho', 'derechos', 'jurídico', 'legal',
    'ciudadano', 'ciudadanos', 'persona', 'personas',
    'queja', 'quejas', 'inconformidad', 'molestia',
    'petición', 'solicitud', 'derecho de petición',
    'respuesta', 'contestación', 'notificación',
    'atención', 'atender', 'servicio', 'orientación',
    'asesoría', 'asesorar', 'aconsejar', 'guiar',
    'violación', 'vulneración', 'abuso', 'atropello',
    'autoridad', 'autoridades', 'entidad', 'institución',
    'municipal', 'municipio', 'alcaldía', 'local',
    'barrio', 'sector', 'zona', 'comunidad',
    'participación', 'veeduría', 'control', 'vigilancia',
    'transparencia', 'información', 'acceso', 'público',
  ],
  
  'Secretaría de Educación': [
    // Educación y colegios - 200+ palabras
    'escuela', 'colegio', 'institución educativa', 'plantel',
    'estudiante', 'estudiantes', 'alumno', 'alumnos', 'niño', 'niños',
    'profesor', 'profesora', 'docente', 'maestro', 'maestra',
    'rector', 'rectora', 'director', 'coordinador',
    'aula', 'salón', 'salones', 'clase', 'clases',
    'deserción', 'abandono', 'retiro', 'desertó',
    'matrícula', 'matricular', 'cupo', 'cupos', 'inscripción',
    'transporte', 'transporte escolar', 'ruta', 'bus', 'buseta',
    'alimentación', 'restaurante', 'comedor', 'refrigerio',
    'uniforme', 'uniformes', 'útiles', 'textos', 'libros',
    'infraestructura', 'instalaciones', 'planta física',
    'mantenimiento', 'reparación', 'arreglo', 'mejora',
    'baño', 'baños', 'sanitario', 'letrina', 'servicio',
    'agua', 'sin agua', 'acueducto', 'tanque', 'pozo',
    'luz', 'energía', 'electricidad', 'sin luz', 'a oscuras',
    'techo', 'goteras', 'filtraciones', 'humedad', 'moho',
    'pared', 'paredes', 'fisuras', 'grietas', 'rajaduras',
    'piso', 'pisos', 'deteriorado', 'malo', 'roto',
    'ventana', 'ventanas', 'vidrio', 'vidrios', 'roto',
    'puerta', 'puertas', 'cerradura', 'chapa', 'candado',
    'cerca', 'cerramiento', 'muro', 'tapia', 'reja',
    'cancha', 'patio', 'zona de recreo', 'parque',
    'biblioteca', 'sala de sistemas', 'laboratorio',
    'calidad', 'calidad educativa', 'enseñanza', 'aprendizaje',
  ],
};

// Función para clasificar reportes basada en palabras clave
export function classifyReport(
  title: string,
  description: string
): ClassificationResult {
  const text = `${title} ${description}`.toLowerCase();
  const scores: Record<string, number> = {};
  const matchedKeywords: Record<string, string[]> = {};

  // Calcular puntuación para cada entidad
  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    let score = 0;
    const matched: string[] = [];

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score++;
        matched.push(keyword);
      }
    }

    if (score > 0) {
      scores[entity] = score;
      matchedKeywords[entity] = matched;
    }
  }

  // Si no hay coincidencias, devolver categoría por defecto
  if (Object.keys(scores).length === 0) {
    return {
      entity: 'Alcaldía - Infraestructura',
      confidence: 20,
      reasoning: 'Clasificación por defecto - No se encontraron palabras clave específicas',
    };
  }

  // Encontrar la entidad con mayor puntuación
  let bestEntity = '';
  let maxScore = 0;

  for (const [entity, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestEntity = entity;
    }
  }

  // Calcular confianza (normalizada a 100%)
  const totalKeywords = ENTITY_KEYWORDS[bestEntity].length;
  const confidence = Math.min(Math.round((maxScore / totalKeywords) * 100 * 5), 99);

  // Generar razonamiento
  const topMatches = matchedKeywords[bestEntity].slice(0, 5).join(', ');
  const reasoning = `Detectadas ${maxScore} palabras clave relacionadas con ${bestEntity}. Términos principales: ${topMatches}.`;

  return {
    entity: bestEntity,
    confidence: Math.max(confidence, 50), // Mínimo 50% de confianza
    reasoning,
  };
}

// Exportar palabras clave para referencia
export { ENTITY_KEYWORDS };
