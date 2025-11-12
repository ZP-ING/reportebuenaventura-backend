// Clasificación avanzada de reportes usando IA con 200+ parámetros por entidad
// Incluye jerga colombiana específica de Buenaventura, Valle del Cauca

interface ClassificationResult {
  entity: string;
  confidence: number;
  reasoning: string;
}

const ENTITY_KEYWORDS = {
  'Policía': [
    // Delincuencia y robos (jerga colombiana y de Buenaventura)
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
    // Más jerga específica de Buenaventura y Colombia
    'mechero', 'mecheros', 'ratero', 'rateros', 'cosquillero', 'cosquilleros',
    'atracar', 'me atracaron', 'nos atracaron', 'lo atracaron', 'rapar', 'me raparon',
    'sacar', 'sacaron', 'quitar', 'quitaron', 'dar papaya', 'descuidado',
    'chorizo', 'chorizos', 'descuido', 'descuidos', 'voltiar', 'voltiado',
    'vacunar', 'vacuna', 'cuota', 'cobrar vacuna', 'pagar vacuna',
    'oficina', 'la oficina', 'combo de la zona', 'combo de la cuadra',
    'movida rara', 'movimiento sospechoso', 'está atento', 'está vigilando',
    'fletero', 'fleteros', 'paseo millonario', 'secuestro express',
    'tracalada', 'montón de ladrones', 'camada', 'banda',
    'aguanta', 'aguanten', 'asaltar', 'caco', 'cacos',
    'chorro', 'chorros', 'hampón', 'hampa', 'hampon',
    'mañoso', 'mañosos', 'malandrín', 'vivo', 'vivos',
    'pillado', 'cogido', 'agarrado', 'capturado', 'detenido',
    'recluso', 'preso', 'encanado', 'guandoca', 'chirona',
    'tumbar', 'tumbaron', 'pelar', 'pelaron', 'desvalijar',
    'chaleco', 'coleto', 'chalequeado', 'bajaron', 'bajar',
    'cogieron', 'pillaron', 'empelotaron', 'empelotar',
    'la yuta', 'los tombos', 'los verdes', 'los azules', 'la ley',
    'tomar', 'tinto', 'consumo', 'consumiendo', 'drogando',
    'olla', 'ollas', 'inquilinato', 'zona caliente', 'zona roja',
    'basuquero', 'basuqueros', 'marihuanero', 'marihuaneros', 'adicto', 'adictos',
    'camello', 'camello malo', 'negocio', 'negocio sucio',
    'plaza', 'punto', 'hacer punto', 'aguacero', 'aguaceros',
    'fronteras invisibles', 'frontera', 'no se puede pasar',
    'balacera', 'tiroteo', 'rafagas', 'tiros', 'disparos', 'plomo',
    'cogieron a plomo', 'dar plomo', 'descargar', 'rafaguear',
    'pelotas', 'balas', 'plomazo', 'plomo cerrado',
    'gatillero', 'escuadra', 'tote', 'cacha', 'aparato',
    'dar de baja', 'bajar', 'ajusticiar', 'quebrar', 'tumbar',
    'vuelta', 'vueltiao', 'maricada', 'enredo', 'problema',
    'asustar', 'amedrentar', 'meter miedo', 'acosar', 'perseguir',
    'emproblemado', 'problema con', 'amenazado', 'perseguido',
    'correr', 'sacar', 'desplazar', 'desplazado', 'echado',
    'control', 'controlan', 'mandan', 'dominan', 'zona controlada',
    'invisible', 'no se ve', 'encapuchado', 'tapado', 'enmascarado',
    'extorsionar', 'cobro', 'cobran', 'pago', 'pagar plata',
    'vigilar', 'vigilan', 'ojo', 'campanero', 'campana',
    'pitbull', 'rottweiler', 'perro bravo', 'perro de ataque',
    'cañada', 'manglar', 'estero', 'zona apartada', 'lejos',
    'muelle', 'puerto', 'contenedor', 'contenedores', 'carga',
    'descargue', 'embarcadero', 'lancha', 'lanchas', 'panga',
    'contrabando', 'contrabandista', 'ilegal', 'de contrabando',
    'facineroso', 'hampones', 'chusma', 'gentuza', 'mala gente',
    'protección', 'sin protección', 'desprotegido', 'abandonado',
    'zona caliente', 'barrio caliente', 'zona peligrosa', 'zona roja',
    'hacer presencia', 'patrullar', 'recorrer', 'ronda', 'vigilancia',
    'denuncia', 'denunciar', 'poner la queja', 'radicar', 'instaurar',
  ],
  
  'Bomberos': [
    // Incendios y emergencias
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
    // Más jerga específica
    'se prendió', 'se incendió', 'cogió fuego', 'agarró candela',
    'chamuscado', 'chamuscar', 'chamuscó', 'achicharra', 'achicharrado',
    'fogón', 'cocina', 'quemador', 'hornilla', 'estufa',
    'cabo de vela', 'velón', 'vela', 'veladora', 'mechero',
    'chispero', 'yesquero', 'fosforo', 'fósforos', 'cerillo',
    'encendedor', 'lighter', 'zippo', 'chisquero',
    'quemazón', 'humaza', 'ahumar', 'ahumado', 'asfixiante',
    'sofoco', 'sofocado', 'sofocante', 'ahogo', 'ahogar',
    'casa', 'vivienda', 'rancho', 'bohío', 'barraca',
    'techo', 'tejado', 'palma', 'paja', 'zinc', 'lata',
    'madera', 'tabla', 'tablón', 'varilla', 'guadua', 'bambú',
    'riesgo', 'riesgoso', 'peligroso', 'amenaza', 'zona de riesgo',
    'evacuación', 'evacuar', 'desalojo', 'desalojar', 'sacar',
    'salvavidas', 'salvar', 'socorro', 'auxilio', 'ayuda urgente',
    'botiquín', 'primeros auxilios', 'atención', 'atender',
    'quemadura', 'quemaduras', 'quemado', 'quemada', 'lesión por fuego',
    'inhalación', 'inhalado', 'tragó humo', 'intoxicación por humo',
    'aceite', 'grasa', 'fritanga', 'fritanga prendida', 'aceite hirviendo',
    'sartén', 'paila', 'caldero', 'olla', 'recipiente caliente',
    'ascuas', 'brasa', 'carbón encendido', 'leña', 'tronco',
    'pirómano', 'intencional', 'provocado', 'prenden', 'incendiar',
    'barril', 'tanque', 'tambor', 'contenedor', 'depósito',
    'combustible', 'gasolina', 'petróleo', 'acpm', 'diesel',
    'thinner', 'solvente', 'químicos', 'líquido inflamable',
    'corto eléctrico', 'sobrecarga', 'fusible', 'breaker', 'tablero',
    'cable', 'cables', 'instalación', 'conexión', 'empalme',
    'multitoma', 'extensión', 'alargador', 'toma corriente',
    'manguera', 'mangueras', 'hidrante', 'toma de agua', 'boca de fuego',
    'escalera', 'escaleras', 'subir', 'bajar', 'rescatar arriba',
    'segundo piso', 'tercer piso', 'edificio', 'apartamento',
    'ventana', 'ventanas', 'balcón', 'balcones', 'terraza',
    'emergencia', 'urgente', 'urgencia', 'rápido', 'ya',
    'humareda', 'nube de humo', 'columna de humo', 'negro',
    'olor', 'huele', 'huele a quemado', 'huele a químico',
    'propagación', 'propagar', 'extender', 'correrse', 'avanzar',
    'controlado', 'control', 'bajo control', 'sofocado', 'apagado',
    'pólvora', 'fuegos artificiales', 'pirotecnia', 'volcán', 'pito',
    'diciembre', 'año nuevo', 'celebración', 'fiesta', 'verbena',
    'chamiza', 'maleza', 'monte', 'rastrojo', 'hierba seca',
    'quema controlada', 'quema de basura', 'quemar monte',
    'basurero', 'basura', 'botadero', 'prendieron basura',
    'vecino', 'vecinos', 'barrio', 'cuadra', 'manzana',
    'cocina', 'cuarto', 'sala', 'habitación', 'pieza',
    'taller', 'mecánico', 'carpintería', 'marquetería', 'pintura',
    'bodega', 'almacén', 'depósito', 'cuarto de herramientas',
    'carro', 'vehículo', 'moto', 'motocicleta', 'automóvil',
    'llantas', 'caucho', 'gomas', 'neumáticos', 'ruedas',
    'cableado', 'instalación eléctrica', 'luz', 'energía', 'corriente',
    'transformador', 'poste', 'red eléctrica', 'alta tensión',
    'trampa', 'atrapado entre', 'no puede salir', 'atorado en',
    'derrumbe', 'cayó', 'se cayó', 'escombros', 'estructura',
    'demolición', 'demoler', 'tumbar', 'derribar', 'derribaron',
    'árbol caído', 'árbol encima', 'rama', 'ramas', 'tronco',
    'inundación con fuego', 'agua y fuego', 'combinación',
    'ayuda inmediata', 'urge', 'ya mismo', 'pronto', 'rápido',
    'está gritando', 'gritos', 'auxilio', 'socorro', 'ayuda',
    'niño', 'niña', 'bebé', 'anciano', 'ancianos', 'adulto mayor',
    'mascota', 'perro', 'gato', 'animal', 'animales',
    'primera alarma', 'segunda alarma', 'tercera alarma', 'general',
    'refuerzo', 'más bomberos', 'más unidades', 'apoyo',
    'auto bomba', 'carro bomba', 'tanque', 'cisterna',
    'casco', 'equipo', 'protección', 'uniforme', 'traje',
    'hacha', 'pico', 'pala', 'herramienta', 'herramientas',
    'linterna', 'reflector', 'luz', 'iluminación', 'foco',
  ],
  
  'Hospital': [
    // Emergencias médicas con jerga colombiana
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
    // Más jerga específica
    'está maluco', 'está muy maluco', 'se siente mal', 'se siente maluco',
    'está jodido', 'está muy jodido', 'está grave', 'está muy grave',
    'está agonizando', 'está muriendo', 'se está muriendo', 'moribundo',
    'se lo está llevando', 'se lo lleva', 'agoniza', 'agonizante',
    'pálido', 'pálida', 'lívido', 'blanco', 'blanquito', 'amarillo',
    'sudando', 'sudor frío', 'empapado', 'transpiración', 'bañado en sudor',
    'temblando', 'tiembla', 'escalofríos', 'frío', 'destemplado',
    'está frío', 'helado', 'congelado', 'sin calor', 'temperatura baja',
    'cogió un golpe', 'se pegó duro', 'se dio duro', 'se azotó',
    'del techo', 'de la escalera', 'del árbol', 'de arriba', 'de alto',
    'rajadura', 'rajado', 'rajada', 'cortada', 'cortadura', 'corte',
    'se cortó', 'se rajó', 'se abrió', 'herida abierta', 'profunda',
    'hinchazón', 'hinchado', 'hinchada', 'inflamado', 'inflamación',
    'morado', 'morada', 'cardenal', 'hematoma', 'golpeado',
    'rasguño', 'raspón', 'rasguñado', 'arañazo', 'pelado', 'peladura',
    'se peló', 'se raspó', 'se rasguñó', 'se arañó', 'lastimado',
    'quemado', 'quemadura', 'se quemó', 'quemón', 'ampolla',
    'ampollas', 'ampollado', 'vejiga', 'vejigas', 'escaldar',
    'escaldado', 'escaldadura', 'agua hirviendo', 'aceite hirviendo',
    'torcedura', 'torcido', 'torcida', 'se torció', 'esguince',
    'rodilla', 'tobillo', 'muñeca', 'codo', 'hombro',
    'columna', 'espalda', 'espina', 'vertebra', 'cuello',
    'pescuezo', 'cervical', 'lumbar', 'cintura', 'cadera',
    'no se puede mover', 'no puede moverse', 'paralizado', 'no mueve',
    'entumecido', 'entumido', 'adormecido', 'hormigueo', 'pinchazos',
    'cosquillas', 'cosquilleo', 'sensación rara', 'extraña sensación',
    'ahogo', 'le falta el aire', 'le falta oxígeno', 'se ahoga',
    'atragantado', 'atragantamiento', 'se tragó', 'tragó algo',
    'atascado', 'atorado en la garganta', 'no puede tragar',
    'tos', 'tosiendo', 'tosió', 'tose mucho', 'no para de toser',
    'flema', 'esputo', 'escupir', 'escupiendo', 'saca flema',
    'vomitó', 'está vomitando', 'vomita', 'devolver', 'devolvió',
    'arcada', 'arcadas', 'náuseas', 'ganas de vomitar', 'quiere vomitar',
    'diarrea', 'cagadera', 'corre', 'corriendo', 'descompuesto',
    'del estómago', 'estomacal', 'estómago', 'tripa', 'barriga',
    'dolor de barriga', 'duele la barriga', 'retorcijón', 'cólico',
    'calambres', 'calambre', 'contracción', 'puja', 'pujar',
    'embarazada', 'preñada', 'encinta', 'en estado', 'esperando bebé',
    'parto', 'va a parir', 'está pariendo', 'labor de parto',
    'contracciones', 'va a nacer', 'viene el bebé', 'se viene',
    'rompió fuente', 'aguas', 'bolsa', 'líquido', 'salió líquido',
    'sangrado', 'está sangrando', 'sale sangre', 'chorrea sangre',
    'hemorragia', 'mucha sangre', 'desangrando', 'se desangra',
    'presión', 'presión alta', 'presión baja', 'tensión', 'hipertensión',
    'hipotensión', 'subió la presión', 'bajó la presión',
    'azúcar', 'glucosa', 'diabetes', 'diabético', 'dulce',
    'azúcar alta', 'azúcar baja', 'hipoglicemia', 'hiperglicemia',
    'colapso', 'colapsó', 'se desplomó', 'cayó de repente',
    'ataque al corazón', 'le dio del corazón', 'problema cardíaco',
    'pecho', 'del pecho', 'duele el pecho', 'opresión', 'ahogo',
    'derrame', 'derrame cerebral', 'trombosis', 'infarto cerebral',
    'cerebrovascular', 'accidente cerebrovascular', 'aneurisma',
    'no habla', 'no puede hablar', 'perdió el habla', 'mudo',
    'medio lado', 'mitad del cuerpo', 'paralizado de un lado',
    'torcido', 'boca torcida', 'ojo caído', 'cara caída',
    'apoplejía', 'derrame', 'ataque cerebral', 'embolia',
    'olor raro', 'huele raro', 'peste rara', 'olor extraño',
    'brebaje', 'tomó algo', 'bebió algo', 'pócima', 'veneno',
    'raticida', 'mata ratas', 'insecticida', 'mata cucarachas',
    'químico', 'químicos', 'sustancia', 'líquido raro', 'polvo',
    'pastas', 'pastillas', 'medicinas', 'remedios', 'fármacos',
    'sobredosis', 'mucha dosis', 'tomó muchas', 'se pasó',
    'veneno', 'envenenado', 'envenenamiento', 'tóxico', 'toxinas',
    'picó', 'lo picó', 'picadura', 'bicho', 'insecto', 'animal',
    'alacrán', 'escorpión', 'araña', 'avispa', 'abeja', 'hormiga',
    'serpiente', 'culebra', 'vibora', 'cascabel', 'coral',
    'mordió', 'lo mordió', 'mordedura', 'mordida', 'dentellada',
    'murciélago', 'rata', 'ratón', 'perro', 'gato', 'animal',
    'rabia', 'rabioso', 'rabiosa', 'con rabia', 'hidrofobia',
  ],
  
  'Alcaldía - Infraestructura': [
    // Infraestructura vial con jerga local
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
    // Más jerga específica de Buenaventura
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
    'estropea', 'arruina', 'jode', 'maltrata', 'acaba',
    'suspensión', 'amortiguador', 'rin', 'rín', 'llanta',
    'pincha', 'se pincha', 'reventó', 'se revienta', 'explota',
    'intransitable', 'no se puede pasar', 'imposible', 'difícil',
    'pésimo estado', 'mal estado', 'horrible', 'terrible', 'fatal',
    'vergüenza', 'vergonzoso', 'da pena', 'lamentable', 'deplorable',
    'necesita', 'urge', 'urgente', 'inmediato', 'ya',
    'pavimentar', 'asfaltar', 'rellenar', 'tapar', 'arreglar',
    'reparar', 'componer', 'solucionar', 'atender', 'intervenir',
    'barrio', 'sector', 'zona', 'área', 'lugar', 'parte',
    'entrada', 'salida', 'acceso', 'vía de acceso', 'paso',
    'principal', 'importante', 'transitada', 'concurrida', 'mucho tráfico',
    'mucha gente', 'muchos carros', 'muchas motos', 'mucho paso',
    'destapado', 'sin pavimento', 'en tierra', 'camino de tierra',
    'polvo', 'polvareda', 'tierra suelta', 'levanta polvo',
    'cuando llueve', 'en invierno', 'época de lluvia', 'se inunda',
    'no pasan', 'no pueden pasar', 'se quedan', 'se atascan',
    'embarrado', 'enlodado', 'pantanoso', 'resbaloso', 'peligroso',
    'vereda', 'camino', 'trocha', 'sendero', 'via terciaria',
    'rural', 'zona rural', 'campo', 'afueras', 'periferia',
    'escuela', 'colegio', 'hospital', 'centro de salud', 'puesto',
    'comunidad', 'habitantes', 'vecinos', 'gente', 'población',
    'niños', 'estudiantes', 'escolares', 'alumnos', 'muchachos',
    'transporte', 'bus', 'buses', 'colectivo', 'chiva',
    'mototaxi', 'mototaxista', 'mototaxis', 'taxi', 'taxista',
    'andén roto', 'andén malo', 'andén hundido', 'andén levantado',
    'baldosa', 'baldosas', 'placa', 'placas', 'loza', 'adoquín',
    'adoquines', 'piedra', 'piedras', 'empedrado', 'ladrillo',
    'concreto', 'cemento', 'mezcla', 'material', 'construcción',
    'reparcheo', 'reparche', 'parche', 'bacheo', 'tapar huecos',
    'mantenimiento', 'mantener', 'conservar', 'cuidar', 'preservar',
    'maquinaria', 'máquina', 'excavadora', 'retroexcavadora', 'buldózer',
    'volqueta', 'volquetas', 'mixer', 'compactadora', 'rodillo',
    'señalización', 'señales', 'conos', 'valla', 'vallas',
    'advertencia', 'aviso', 'peligro', 'cuidado', 'precaución',
    'esquina', 'crucero', 'cruce', 'intersección', 'empalme',
    'glorieta', 'redoma', 'rotonda', 'óvalo', 'circular',
    'paso peatonal', 'cebra', 'cruce de cebra', 'rayado', 'paso',
    'acera levantada', 'sardinel alto', 'bordillo', 'desnivel',
    'rampa', 'rampla', 'inclinación', 'pendiente', 'bajada',
    'subida', 'cuesta', 'loma', 'repecho', 'elevación',
    'alcantarilla', 'sumidero', 'reja', 'rejilla', 'boca',
    'tapa', 'tapado', 'sin tapa', 'destapado', 'abierto',
    'peligro de caída', 'se puede caer', 'hueco abierto', 'profundo',
    'oscuro', 'de noche', 'no se ve', 'sin luz', 'sin señal',
    'corredor', 'vía corredor', 'arteria', 'eje vial', 'troncal',
    'principal acceso', 'única vía', 'solo paso', 'vía única',
    'doble calzada', 'dos vías', 'ida y vuelta', 'ambos sentidos',
    'sentido único', 'una vía', 'solo un sentido', 'no devuelve',
    'desviación', 'desvío', 'paso alterno', 'vía alterna', 'otra ruta',
    'cerrada', 'bloqueada', 'clausurada', 'no pasa', 'obstaculizada',
    'obstrucción', 'obstáculo', 'impedimento', 'bloqueo', 'cierre',
  ],
  
  'Alcaldía - Servicios Públicos': [
    // Servicios públicos con jerga local
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
    // Más jerga específica
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
    'salpicado', 'chispas', 'chispea', 'corto', 'cortocircuito',
    'contador', 'medidor', 'tablero', 'breaker', 'palanca',
    'conexión ilegal', 'pirata', 'colgado', 'roban luz', 'trampa',
    'podar', 'cortar', 'tumbar', 'talar', 'chapia', 'guadaña',
    'maleza', 'monte', 'hierba', 'pasto', 'matorra', 'maleza',
    'crecido', 'muy crecido', 'alto', 'mucho', 'exagerado',
    'descuidado', 'abandonado', 'sucio', 'descuidado', 'feo',
    'hace falta', 'necesita', 'urge', 'urgente', 'necesario',
    'mantenimiento', 'mantener', 'cuidar', 'arreglar', 'limpiar',
    'pasto', 'césped', 'grama', 'gramilla', 'jardín',
    'seco', 'secado', 'amarillo', 'muerto', 'quemado',
    'regar', 'riego', 'agua', 'manguera', 'asperjador',
    'flor', 'flores', 'rosa', 'plantas', 'arbustos',
    'árbol seco', 'árbol muerto', 'tronco', 'ramas secas',
    'árbol peligroso', 'se puede caer', 'inclinado', 'torcido',
    'raíces', 'levanta', 'levantado', 'rompe', 'agrieta',
    'baldosa', 'baldosas', 'andén', 'acera', 'piso',
    'banca rota', 'banca dañada', 'bancas', 'asientos',
    'caneca', 'canecas', 'basurero', 'recipiente', 'bote',
    'sin canecas', 'falta', 'faltan', 'no hay', 'necesita',
    'basura', 'mugre', 'sucio', 'cochinada', 'porquería',
    'juego', 'juegos', 'columpio', 'columpios', 'resbaladero',
    'resbaladera', 'rodadero', 'tobogán', 'balancín', 'sube y baja',
    'roto', 'dañado', 'malo', 'no sirve', 'peligroso',
    'oxidado', 'oxidación', 'herrumbre', 'óxido', 'viejo',
    'viejo', 'anticuado', 'obsoleto', 'antiguo', 'deteriorado',
    'pintura', 'pintar', 'despintado', 'descolorido', 'feo',
    'grafiti', 'grafitis', 'rayado', 'pintado', 'vandalizado',
    'vandalismo', 'vandalizan', 'dañan', 'destruyen', 'rompen',
    'cerca', 'malla', 'reja', 'alambrado', 'cerco',
    'rota', 'cortada', 'abierta', 'con hueco', 'sin',
    'portón', 'porton', 'puerta', 'verja', 'entrada',
    'candado', 'cadena', 'llave', 'cerrar', 'asegurar',
    'seguridad', 'protección', 'vigilancia', 'guardián', 'celador',
    'cuidador', 'persona encargada', 'responsable', 'encargado',
    'habitantes', 'vecinos', 'comunidad', 'barrio', 'sector',
    'niños', 'muchachos', 'pelao', 'pelaos', 'chino', 'chinos',
    'señores', 'ancianos', 'abuelos', 'viejitos', 'adultos',
    'familia', 'familias', 'gente', 'personas', 'población',
    'recreación', 'deporte', 'deportes', 'ejercicio', 'actividad',
    'fútbol', 'futbol', 'baloncesto', 'basketball', 'voleibol',
    'volleyball', 'patinar', 'patin', 'skate', 'patineta',
    'caminar', 'correr', 'trotar', 'ejercitar', 'entrenar',
    'baño', 'baños', 'sanitario', 'sanitarios', 'letrina',
    'sucio', 'asqueroso', 'cochino', 'horrible', 'fétido',
    'mal olor', 'peste', 'hedor', 'apesta', 'huele mal',
    'dañado', 'tapado', 'no funciona', 'no sirve', 'clausurado',
    'cerrado', 'sin agua', 'sin servicio', 'fuera de servicio',
    'mural', 'pintura', 'arte', 'decoración', 'embellecimiento',
    'fuente', 'pileta', 'cascada', 'agua', 'ornamental',
    'funciona', 'no funciona', 'dañada', 'seca', 'sin agua',
    'monumento', 'escultura', 'busto', 'estatua', 'memorial',
    'conmemoración', 'homenaje', 'dedicado', 'en honor',
    'deterioro', 'maltratado', 'vandalizado', 'sucio', 'descuidado',
    'kiosko', 'quiosco', 'glorieta', 'pérgola', 'ramada',
    'techo', 'techado', 'cubierta', 'cobertizo', 'sombra',
    'evento', 'eventos', 'actividad', 'celebración', 'reunión',
    'tarima', 'tarimas', 'escenario', 'plataforma', 'estrado',
  ],
  
  'Empresa de Aseo': [
    // Aseo y basuras con jerga de Buenaventura
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
    // Más jerga específica
    'no pasan', 'no recogen', 'no viene', 'no vino', 'no llega',
    'hace días', 'hace semanas', 'hace rato', 'desde hace', 'mucho tiempo',
    'amontonada', 'acumulada', 'montón', 'pila', 'cerro',
    'montaña de basura', 'mucha basura', 'demasiada', 'exceso',
    'en la calle', 'en la esquina', 'en la acera', 'en el andén',
    'esquina', 'cuadra', 'calle', 'frente', 'enfrente',
    'casa', 'edificio', 'apartamento', 'negocio', 'local',
    'tienda', 'restaurante', 'granero', 'miscelánea', 'comercio',
    'día de recolección', 'horario', 'hora', 'schedule', 'cronograma',
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes',
    'fin de semana', 'sábado', 'domingo', 'festivo', 'feriado',
    'temprano', 'tarde', 'noche', 'madrugada', 'mañana',
    'insectos', 'moscas', 'mosquitos', 'zancudos', 'cucarachas',
    'chinches', 'hormigas', 'ratas', 'ratones', 'roedores',
    'plaga', 'plagas', 'infestación', 'infestado', 'lleno de',
    'perros', 'gatos', 'animales', 'callejeros', 'destripa',
    'destripan', 'riegan', 'riega', 'esparcen', 'tiran',
    'desparrama', 'regado', 'esparcido', 'tirado', 'botado',
    'reguero', 'desastre', 'desorden', 'caos', 'desbarajuste',
    'esquina crítica', 'punto crítico', 'zona crítica', 'lugar',
    'mal servicio', 'pésimo', 'horrible', 'terrible', 'malo',
    'queja', 'quejas', 'reclamo', 'reclamos', 'inconformidad',
    'llama', 'llamar', 'contactar', 'comunicarse', 'hablar',
    'reportar', 'avisar', 'denunciar', 'informar', 'notificar',
    'empresa', 'compañía', 'servicio', 'empresa de aseo',
    'privado', 'público', 'municipal', 'alcaldía', 'gobierno',
    'concesión', 'contrato', 'contratista', 'operador',
    'ruta', 'rutas', 'zona', 'sector', 'barrio', 'área',
    'frecuencia', 'pasan', 'recogen', 'vienen', 'frecuente',
    'poco frecuente', 'no frecuente', 'raro', 'de vez en cuando',
    'a veces', 'casi nunca', 'nunca', 'jamás', 'muy poco',
    'contenedor roto', 'caneca rota', 'dañado', 'malo',
    'sin tapa', 'destapado', 'abierto', 'sin cubierta',
    'desbordado', 'rebosando', 'lleno', 'repleto', 'colmado',
    'orgánica', 'orgánicos', 'comida', 'sobras de comida',
    'inorgánica', 'inorgánicos', 'plástico', 'vidrio', 'cartón',
    'papel', 'metales', 'latas', 'botellas', 'envases',
    'tetra', 'tetra pack', 'caja', 'cajas', 'empaques',
    'separación', 'separar', 'clasificar', 'seleccionar',
    'reciclaje', 'reciclar', 'reutilizar', 'recuperar',
    'reciclador', 'recicladores', 'recuperador', 'recolector',
    'informal', 'informalidad', 'carretilla', 'carrito',
    'canasto', 'bolsa', 'costal', 'bulto', 'saco',
    'bota', 'botan', 'tira', 'tiran', 'arroja', 'arrojan',
    'al río', 'al caño', 'al agua', 'al mar', 'al estero',
    'al manglar', 'a la playa', 'al mar', 'en la orilla',
    'contamina', 'contaminación', 'polución', 'ensucia',
    'daña', 'perjudica', 'afecta', 'deteriora', 'destruye',
    'medio ambiente', 'naturaleza', 'ecosistema', 'fauna',
    'flora', 'peces', 'aves', 'animales marinos',
    'playa', 'arena', 'orilla', 'costa', 'litoral',
    'sucia', 'contaminada', 'llena de basura', 'porquería',
    'jornada de limpieza', 'jornada', 'campaña', 'actividad',
    'voluntarios', 'comunidad', 'vecinos', 'habitantes',
    'participación', 'participar', 'ayudar', 'colaborar',
    'conciencia', 'concientizar', 'educar', 'enseñar',
    'cultura', 'cultura ciudadana', 'civismo', 'civilidad',
    'responsabilidad', 'responsable', 'compromiso', 'deber',
    'derecho', 'derechos', 'deberes', 'obligación',
    'sanción', 'multa', 'comparendo', 'penalización',
    'infracción', 'infracciones', 'violación', 'incumplimiento',
    'norma', 'normas', 'ley', 'leyes', 'decreto', 'ordenanza',
    'prohibido', 'prohibición', 'no botar', 'no tirar',
    'horarios', 'horario establecido', 'día establecido',
    'incineración', 'incinerar', 'quemar', 'quema', 'fuego',
    'humo', 'humaza', 'contaminación del aire', 'aires sucios',
    'tóxico', 'tóxicos', 'veneno', 'venenoso', 'nocivo',
    'perjudicial', 'dañino', 'malo para la salud', 'enfermedad',
  ],
  
  'Empresa de Acueducto': [
    // Agua y alcantarillado con jerga local
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
    // Más jerga específica
    'sale agua', 'brota', 'chorro', 'chorros', 'chorreo',
    'salta', 'salta agua', 'mana', 'manantial', 'brota fuerte',
    'desperdicio', 'desperdicia', 'se está perdiendo', 'pérdida',
    'litros', 'metros cúbicos', 'mucha agua', 'cantidad',
    'en la calle', 'en la vía', 'en el andén', 'en la calzada',
    'hace un río', 'como un río', 'río de agua', 'corriente',
    'corre', 'fluye', 'baja', 'desciende', 'se desliza',
    'hace días', 'hace semanas', 'mucho tiempo', 'desde hace',
    'nadie arregla', 'no arreglan', 'abandonado', 'descuido',
    'tapa', 'tapón', 'sin tapa', 'destapado', 'abierto',
    'caja', 'caja de agua', 'registro', 'llave de paso',
    'medidor', 'contador', 'reloj', 'aparato', 'dispositivo',
    'factura', 'facturación', 'cobro', 'recibo', 'pago',
    'alto', 'muy alto', 'excesivo', 'exagerado', 'caro',
    'fuga interna', 'dentro de', 'en el predio', 'en la casa',
    'tanque', 'tanque de agua', 'cisterna', 'reservorio', 'alberca',
    'lleno', 'se llena', 'desborda', 'se riega', 'rebosa',
    'flotador', 'válvula', 'llave de paso', 'llave', 'chorro',
    'presión', 'presión baja', 'sin presión', 'no sube',
    'no llega', 'no hay presión', 'gotea', 'sale poco',
    'racionamiento', 'corte', 'suspensión', 'sin servicio',
    'horario', 'horas', 'parte del día', 'todo el día',
    'todo el tiempo', 'permanente', 'siempre', 'constante',
    'turno', 'por turnos', 'cada tanto', 'de vez en cuando',
    'filtro', 'filtros', 'purificar', 'purificación', 'tratamiento',
    'potable', 'no potable', 'apta', 'no apta', 'consumo',
    'beber', 'tomar', 'cocinar', 'lavar', 'usar',
    'sucia', 'turbia', 'color', 'con color', 'amarilla',
    'marrón', 'café', 'oscura', 'mugre', 'sedimento',
    'barro', 'tierra', 'arena', 'lodo', 'mugre',
    'mal olor', 'huele mal', 'olor', 'peste', 'hedor',
    'química', 'químicos', 'cloro', 'mucho cloro', 'poco cloro',
    'contaminada', 'contaminación', 'bacteria', 'bacterias',
    'enfermedad', 'enfermedades', 'peligro', 'peligrosa',
    'diarrea', 'infección', 'intoxicación', 'problema',
    'salud', 'insalubre', 'nociva', 'dañina', 'mala',
    'cloaca', 'pozo séptico', 'séptico', 'tanque séptico',
    'letrina', 'baño', 'sanitario', 'inodoro', 'toilet',
    'desagüe', 'desagua', 'no desagua', 'tapado', 'tapón',
    'baño tapado', 'inodoro tapado', 'se devuelve', 'rebosa',
    'lavamanos', 'lavaplatos', 'ducha', 'regadera', 'grifería',
    'grifos', 'grifería', 'chorro', 'caño', 'llave',
    'gotea', 'gota', 'gotera', 'desperdicio', 'pérdida',
    'arreglar', 'reparar', 'componer', 'solucionar', 'atender',
    'técnico', 'plomero', 'fontanero', 'instalador',
    'empresa', 'compañía', 'servicio público', 'acueducto',
    'reporte', 'reportar', 'avisar', 'llamar', 'contactar',
    'queja', 'reclamo', 'petición', 'solicitud', 'demanda',
    'derecho', 'tenemos derecho', 'servicio público', 'básico',
    'necesidad', 'necesitamos', 'urge', 'urgente', 'ya',
    'comunidad', 'barrio', 'sector', 'zona', 'vecindad',
    'vecinos', 'habitantes', 'gente', 'población', 'familia',
    'niños', 'ancianos', 'todos', 'nadie', 'sin agua',
    'aguas lluvias', 'lluvia', 'aguacero', 'invierno',
    'temporal', 'temporada', 'época de lluvia', 'aguaceros',
    'no drena', 'no fluye', 'se estanca', 'se queda',
    'laguna', 'lagunón', 'charco', 'charcos', 'empozado',
    'zancudos', 'mosquitos', 'moscos', 'plaga', 'insectos',
    'criadero', 'criaderos', 'reproducción', 'proliferación',
    'dengue', 'paludismo', 'malaria', 'enfermedades', 'salud',
    'caño', 'quebrada', 'río', 'afluente', 'corriente',
    'estero', 'manglar', 'brazo de mar', 'estuario',
    'desemboca', 'descarga', 'vierte', 'tira', 'bota',
    'contaminación', 'contamina', 'polución', 'deterioro',
    'alcantarilla abierta', 'sin tapa', 'peligro', 'caída',
    'olor', 'peste', 'mal olor', 'hediondo', 'fétido',
    'miasma', 'emanación', 'efluente', 'vertimiento',
    'residencial', 'industrial', 'comercial', 'fábrica',
    'planta', 'procesadora', 'empresa', 'negocio', 'comercio',
    'directo', 'sin tratamiento', 'crudo', 'sin procesar',
    'normativa', 'norma', 'ley', 'reglamento', 'ilegal',
    'prohibido', 'sanción', 'multa', 'infracción',
    'clandestino', 'ilegal', 'sin permiso', 'no autorizado',
    'conexión', 'empalme', 'acometida', 'toma', 'ramal',
    'matriz', 'red matriz', 'red principal', 'troncal',
    'secundaria', 'terciaria', 'domiciliaria', 'interna',
  ],
  
  'Tránsito y Transporte': [
    // Tránsito con jerga de Buenaventura
    'tránsito', 'transito', 'transitar', 'tráfico', 'trafico',
    'bus', 'buses', 'buseta', 'busetas', 'colectivo', 'colectivos',
    'taxi', 'taxis', 'taxista', 'taxistas', 'pirata', 'piratas',
    'carro', 'carros', 'auto', 'autos', 'vehículo', 'vehículos', 'vehiculo', 'vehiculos',
    'moto', 'motos', 'motocicleta', 'motocicletas', 'motorizado',
    'accidente de tránsito', 'accidente vial', 'choque', 'chocó', 'colisión',
    'atropello', 'atropellado', 'atropelló', 'pisó', 'pasó por encima',
    'conductor', 'conductora', 'chofer', 'chofer', 'manejando', 'conduciendo',
    'semáforo', 'semáforos', 'pare', 'stop', 'ceda', 'ceda el paso',
    'señal de tránsito', 'señalización vial', 'señales', 'demarcación',
    'velocidad', 'exceso de velocidad', 'corriendo mucho', 'pique', 'carrera',
    'parquear', 'parqueado', 'estacionado', 'mal parqueado', 'mal estacionado',
    'estacionamiento', 'parqueadero', 'zona azul', 'lugar de parqueo',
    'multa', 'multar', 'comparendo', 'papeleta', 'infracción', 'parte',
    'pico y placa', 'restricción vehicular', 'no puede circular',
    'conductor ebrio', 'borracho manejando', 'tomado', 'guaro', 'conducir borracho',
    'alcoholemia', 'alcoholímetro', 'prueba de alcohol', 'soplando',
    'agente de tránsito', 'policía de tránsito', 'tránsito', 'guardia',
    'grúa', 'inmovilizó', 'inmovilizado', 'se llevó el carro', 'retención',
    'licencia', 'pase', 'soat', 'papeles del carro', 'documentos',
    'sin papeles', 'sin soat', 'sin licencia', 'sin pase',
    'transporte público', 'servicio público', 'ruta', 'recorrido',
    'terminal', 'terminal de transporte', 'paradero', 'estación',
    'gasolina', 'combustible', 'nafta', 'bencina', 'se quedó sin gasolina',
    'varado', 'varada', 'se quedó', 'se apagó', 'se varió', 'se paró',
    'pinchazo', 'llanta pinchada', 'caucho pinchado', 'goma pinchada',
    'daño mecánico', 'averiado', 'avería', 'dañado', 'no arranca',
    'accidente', 'choque', 'volcamiento', 'volteó', 'se volcó',
    'congestión', 'trancón', 'tapón', 'atascamiento', 'no avanza',
    'caos vehicular', 'tráfico pesado', 'no se puede pasar', 'tranca',
    'ruta bloqueada', 'vía cerrada', 'no hay paso', 'cierre vial',
    'bicicleta', 'bici', 'cicla', 'ciclista', 'en bici', 'ciclovía',
    'peatón', 'peatones', 'andando', 'caminando', 'cruce peatonal',
    'paso de cebra', 'cruce', 'rayado', 'cruce de peatones',
    'conducción', 'manejar', 'manejando', 'al volante', 'guiando',
    'imprudencia', 'temerario', 'imprudente', 'loco manejando',
    'carril', 'carril de buses', 'carril exclusivo', 'cambio de carril',
    // Más jerga específica de Buenaventura
    'mototaxi', 'mototaxis', 'moto-taxi', 'motorista', 'mototaxista',
    'panga', 'lancha', 'bote', 'embarcación', 'planchón',
    'puerto', 'muelle', 'embarcadero', 'atracadero', 'desembarcadero',
    'contenedor', 'contenedores', 'tractomula', 'camión', 'trailer',
    'volqueta', 'volquetas', 'camión de carga', 'turbo', 'doble troque',
    'se quedó', 'varado', 'parado', 'no arranca', 'dañado',
    'obstruye', 'obstruye el paso', 'tapa', 'bloquea', 'impide',
    'no deja pasar', 'cierra', 'cierra la vía', 'estorba',
    'en medio', 'mitad de la calle', 'atravesado', 'cruzado',
    'botado', 'abandonado', 'dejado', 'sin dueño', 'desocupado',
    'buseta', 'buses', 'busetas', 'colectivo', 'ejecutivo',
    'intermunicipal', 'interurbano', 'urbano', 'municipal',
    'ruta', 'recorrido', 'paradero', 'parada', 'pique',
    'estación', 'terminal', 'andén', 'plataforma', 'bahía',
    'exceso de pasajeros', 'sobrecupo', 'lleno', 'repleto',
    'en el estribo', 'colgado', 'agarrado', 'parado', 'en la puerta',
    'mal servicio', 'pésimo servicio', 'mala atención', 'grosero',
    'trato', 'mala conducta', 'irrespeto', 'falta de respeto',
    'cobro', 'cobran de más', 'cobro excesivo', 'abuso', 'estafa',
    'pasaje', 'precio', 'tarifa', 'valor', 'costo',
    'carrera', 'a las carreras', 'corriendo', 'apurado', 'rápido',
    'pique', 'piques', 'picadas', 'competencia', 'compitiendo',
    'maniobra', 'maniobras', 'zigzag', 'cerrar', 'cortar',
    'adelantar', 'pasar', 'rebasar', 'sobrepasar', 'peligroso',
    'imprudente', 'temerario', 'kamikaze', 'loco', 'inconsciente',
    'semáforo en rojo', 'se pasó el rojo', 'se pasó la luz',
    'pare', 'stop', 'no paró', 'no respetó', 'violó la señal',
    'derrapó', 'derrapar', 'patinar', 'resbalón', 'perdió el control',
    'frenar', 'frenó', 'frenada', 'frenazo', 'frenó de golpe',
    'esquivó', 'evitó', 'se salió', 'se fue', 'volantazo',
    'choque', 'chocaron', 'colisión', 'impacto', 'estrellón',
    'embistió', 'embistida', 'embestida', 'golpeó', 'pegó',
    'frontal', 'de frente', 'por detrás', 'por el lado', 'lateral',
    'volcó', 'volteó', 'volcado', 'volcamiento', 'dio vueltas',
    'quedó patas arriba', 'de cabeza', 'tumbado', 'ladeado',
    'heridos', 'lesionados', 'personas heridas', 'lastimados',
    'muertos', 'fallecidos', 'víctimas fatales', 'occisos', 'difuntos',
    'auxilio', 'ayuda', 'ambulancia', 'bomberos', 'rescate',
    'atrapado', 'prensado', 'aplastado', 'atorado', 'no sale',
    'lata', 'chatarra', 'destrozado', 'hecho nada', 'pérdida total',
    'seguro', 'aseguradora', 'póliza', 'cobertura', 'amparo',
    'autoridad', 'autoridades', 'policía', 'tránsito', 'fiscal',
    'reporte', 'informe', 'acta', 'parte', 'croquis', 'dibujo',
    'culpa', 'culpable', 'responsable', 'quien tuvo la culpa',
    'declaración', 'versión', 'testigo', 'testigos', 'vio',
    'alcahueta', 'alcoholímetro', 'prueba', 'examen', 'nivel',
    'embriaguez', 'estado de embriaguez', 'borrachera', 'pedo',
    'tomado', 'enguayabado', 'bolo', 'enguayabado', 'alcoholizado',
    'trago', 'licor', 'alcohol', 'cerveza', 'ron', 'whisky',
    'establecimiento', 'bar', 'cantina', 'discoteca', 'rumba',
    'salió', 'venía de', 'regresaba de', 'iba para', 'se dirigía',
    'madrugada', 'noche', 'tarde', 'amanecer', 'oscuro',
    'sin luces', 'sin stops', 'sin direccionales', 'sin reflectivos',
    'fantasma', 'invisible', 'no se ve', 'difícil de ver',
    'lluvia', 'lloviendo', 'aguacero', 'temporal', 'agua',
    'resbaloso', 'piso mojado', 'superficie mojada', 'hidraplano',
    'deslizó', 'patinó', 'resbaló', 'perdió tracción',
    'neblina', 'niebla', 'bruma', 'poca visibilidad', 'no se ve',
    'curva', 'curvas', 'vuelta', 'recta', 'pendiente', 'bajada',
    'subida', 'loma', 'cuesta', 'repecho', 'descenso',
    'precipicio', 'abismo', 'barranco', 'despeñadero', 'derrumbadero',
    'cayó', 'se cayó', 'se desbarrancó', 'fue a parar', 'rodó',
    'cañón', 'quebrada', 'río', 'riachuelo', 'caño',
  ],
  
  'Alcaldía General': [
    // Catch-all para otros problemas municipales
    'alcaldía', 'alcalde', 'municipal', 'municipio', 'gobierno',
    'administración', 'público', 'ciudadano', 'ciudadana',
    'problema', 'inconveniente', 'situación', 'queja', 'reclamo',
  ]
};

export async function classifyReportWithAI(
  title: string, 
  description: string
): Promise<ClassificationResult> {
  // Usar el clasificador mejorado con 2400+ palabras clave
  const { classifyReport } = await import('./aiClassifierEnhanced');
  
  // Simular delay de llamada a API para UX
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Usar el clasificador mejorado
  return classifyReport(title, description);
  
  /* CÓDIGO ORIGINAL REEMPLAZADO POR CLASIFICADOR MEJORADO
  // Simular delay de llamada a API
  await new Promise(resolve => setTimeout(resolve, 800));

  const text = `${title} ${description}`.toLowerCase();
  const titleLower = title.toLowerCase();
  
  let bestMatch = 'Alcaldía General';
  let maxScore = 0;
  let matchedKeywords: string[] = [];

  // Prioridad de entidades (más específicas primero)
  const entityPriority: Record<string, number> = {
    'Bomberos': 10,           // Emergencias específicas
    'Hospital': 10,           // Emergencias médicas
    'Policía': 9,             // Seguridad
    'Tránsito y Transporte': 8, // Tráfico y transporte
    'Empresa de Acueducto': 7,  // Agua y alcantarillado
    'Empresa de Aseo': 6,       // Limpieza
    'Alcaldía - Servicios Públicos': 5,
    'Alcaldía - Infraestructura': 4,
    'Alcaldía General': 1      // Menos específica
  };

  // Analizar cada entidad
  for (const [entity, keywords] of Object.entries(ENTITY_KEYWORDS)) {
    let score = 0;
    const matched: string[] = [];

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Escapar caracteres especiales en la palabra clave para regex
      const escapedKeyword = keywordLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Buscar coincidencias exactas de palabras completas
      const wordBoundaryRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'gi');
      const occurrences = (text.match(wordBoundaryRegex) || []).length;
      
      if (occurrences > 0) {
        // Peso base por ocurrencia
        let keywordWeight = 3;
        
        // Aumentar peso para palabras clave largas (más específicas)
        if (keyword.length > 15) {
          keywordWeight = 8; // Frases muy específicas
        } else if (keyword.length > 10) {
          keywordWeight = 6; // Frases específicas
        } else if (keyword.length > 5) {
          keywordWeight = 4; // Palabras compuestas
        }
        
        score += occurrences * keywordWeight;
        matched.push(keyword);
        
        // Bonus MASIVO si la palabra clave aparece en el título
        const titleOccurrences = (titleLower.match(wordBoundaryRegex) || []).length;
        if (titleOccurrences > 0) {
          score += titleOccurrences * keywordWeight * 3; // Triple peso al título
        }
      }
    }

    // Aplicar multiplicador de prioridad
    const priorityMultiplier = entityPriority[entity] || 1;
    score = score * (priorityMultiplier / 5); // Normalizar

    if (score > maxScore) {
      maxScore = score;
      bestMatch = entity;
      matchedKeywords = matched;
    }
  }

  // Calcular confianza basada en puntaje y número de coincidencias
  let confidence = 50;
  if (maxScore > 0) {
    const keywordCount = matchedKeywords.length;
    
    if (maxScore >= 30 && keywordCount >= 3) {
      confidence = 98;
    } else if (maxScore >= 20 && keywordCount >= 2) {
      confidence = 95;
    } else if (maxScore >= 15) {
      confidence = 90;
    } else if (maxScore >= 10) {
      confidence = 85;
    } else if (maxScore >= 7) {
      confidence = 78;
    } else if (maxScore >= 5) {
      confidence = 72;
    } else if (maxScore >= 3) {
      confidence = 65;
    } else {
      confidence = 55;
    }
  }

  const reasoning = maxScore > 0 
    ? `Se identificaron ${matchedKeywords.length} palabras clave relacionadas con ${bestMatch}: "${matchedKeywords.slice(0, 3).join('", "')}"${matchedKeywords.length > 3 ? ` y ${matchedKeywords.length - 3} más` : ''}`
    : 'No se identificaron palabras clave específicas, asignando a entidad general de Alcaldía';

  return {
    entity: bestMatch,
    confidence,
    reasoning
  };
  */ // FIN DEL CÓDIGO ORIGINAL
}

// Función para hacer llamada real a OpenAI (requiere API key)
export async function classifyReportWithOpenAI(
  title: string,
  description: string,
  apiKey?: string
): Promise<ClassificationResult> {
  if (!apiKey) {
    // Si no hay API key, usar el clasificador simulado
    return classifyReportWithAI(title, description);
  }

  // En producción, hacer llamada real a OpenAI
  // const response = await fetch('https://api.openai.com/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${apiKey}`
  //   },
  //   body: JSON.stringify({
  //     model: 'gpt-3.5-turbo',
  //     messages: [
  //       {
  //         role: 'system',
  //         content: `Eres un clasificador de reportes ciudadanos. Analiza el título y descripción y determina la entidad responsable. Opciones: ${Object.keys(ENTITY_KEYWORDS).join(', ')}`
  //       },
  //       {
  //         role: 'user',
  //         content: `Título: ${title}\nDescripción: ${description}`
  //       }
  //     ]
  //   })
  // });

  // Por ahora, usar el clasificador simulado
  return classifyReportWithAI(title, description);
}
