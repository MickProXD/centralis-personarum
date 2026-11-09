// Genera manual/manual.json. Lenguaje sencillo, sin detalles técnicos. Al publicar una mejora: subir `version`, agregar una novedad y regenerar capturas.
const fs = require('fs');
const VERSION = '2026-11-09b';
const novedades = [
  { titulo:'Hora de llegada y tendencia en Asistencias', fecha:'9 nov 2026', texto:'Ahora ves a qué hora llegó cada persona y por qué fue retardo. Los reportes de Excel y PDF salen con el formato de RH e incluyen la tendencia de puntualidad.', perfiles:['supervisor','rh','direccion_ceo'] },
  { titulo:'Manual de usuario', fecha:'9 nov 2026', texto:'Ahora cada perfil tiene su propio manual con paso a paso e imágenes. Lo encuentras en el menú, en "Manual".' },
  { titulo:'Registro de asistencia con un toque', fecha:'6 nov 2026', texto:'Escanea el QR de tu Bio-Nave y se registra tu entrada. Instala la app en tu teléfono para hacerlo más rápido.', perfiles:['chofer','ayudante','supervisor','mantenimiento','monitoreo','administrativo_operativa','administrativo_finanzas','administracion','she','rh'] },
  { titulo:'Reto semanal', fecha:'4 nov 2026', texto:'Cada semana hay un reto de asistencia para tu equipo. Míralo en "Mi asistencia".', perfiles:['chofer','ayudante','supervisor','mantenimiento','monitoreo','administrativo_operativa','administrativo_finanzas','administracion','she'] },
];
const P = (p,i,x) => ({ t:p, x: x?'. '+x:'', img:i });

// Bloques que se repiten en todos los perfiles
const sEntrar = () => ({ titulo:'Entrar a Bio-centralis', min:'2 min', intro:'Entras con tu correo, tu contraseña y un código de seguridad que cambia cada 30 segundos.', pasos:[
  { t:'Escribe tu correo y contraseña', x:'. Son los que te dio Recursos Humanos al darte de alta.' },
  { t:'Escribe el código de seguridad', x:'. Lo ves en tu aplicación de códigos (la que configuraste al entrar por primera vez).' },
  { t:'Instala la app en tu teléfono', x:'. Cuando te lo sugiera, acepta. Así entras más rápido y puedes activar huella o rostro para no escribir tu contraseña.' } ],
  tip:'Si olvidaste tu contraseña, avisa a Recursos Humanos; ellos te generan una nueva desde el sistema. Nadie más debe pedírtela.' });
const sAsis = (k) => ({ titulo:'Registrar tu asistencia', min:'1 min', intro:'Tu entrada y salida quedan guardadas con la hora y el lugar. Así se calcula tu puntualidad y tus puntos.', pasos:[
  P('Abre "Mi asistencia"', k+'/miasistencia.webp', 'En el menú elige Mi asistencia.'),
  { t:'Toca "Registrar entrada"', x:'. Si estás en tu Bio-Nave, también puedes escanear el QR del cartel y se registra solo.' },
  { t:'Al terminar tu jornada toca "Registrar salida"' },
  { t:'Revisa tu mes', x:'. Verás cuántos días fuiste puntual, con precaución o con retardo, tus puntos y tu racha.' } ],
  tip:'Registrar tu entrada a tiempo suma puntos y ayuda a que tu equipo cumpla el reto semanal.' });
const sPerfil = (k) => ({ titulo:'Tu perfil y tu cuenta', min:'2 min', intro:'Aquí ves tus datos y puedes cambiar tu contraseña.', pasos:[
  P('Abre "Mi perfil"', k+'/miperfil.webp'),
  { t:'Cambia tu contraseña cuando lo necesites', x:'. Elige una que solo tú conozcas; no la compartas.' },
  { t:'Cierra sesión al terminar si usas un equipo compartido' } ] });
const sMuro = (k) => ({ titulo:'Bio-Muro: avisos y reconocimientos', min:'1 min', intro:'Es el tablón de la empresa: avisos importantes y felicitaciones.', pasos:[
  P('Abre "Bio-Muro"', k+'/muro.webp'),
  { t:'Lee los avisos fijados arriba', x:'. Son los más importantes.' },
  { t:'Reacciona con 👍 ❤️ 🎉 ⭐', x:' para felicitar a tus compañeros.' } ] });
const sSolicOK = (k, tip) => ({ titulo:'Hacer una solicitud', min:'2 min', intro:'Para pedir permisos, vacaciones, material u otros apoyos. Quien debe aprobarla la recibe y verás su respuesta.', tip, pasos: [
  P('Abre "Solicitudes"', k+'/solicitudes.webp'),
  { t:'Toca "Nueva solicitud"', x:' y elige el tipo.' },
  { t:'Cuéntanos el detalle', x:'. Entre más claro, más rápido se resuelve.' },
  { t:'Da seguimiento', x:'. Verás si está pendiente, aprobada o rechazada.' } ] });
const sSeg = (k) => ({ titulo:'Reportar un riesgo (Seguridad)', min:'2 min', intro:'Si ves algo inseguro —un piso mojado, un cable suelto— repórtalo para que se corrija a tiempo.', pasos:[
  P('Abre "Seguridad"', k+'/seguridad.webp'),
  { t:'Toca "Reportar incidente o condición insegura"' },
  { t:'Cuenta qué pasó, dónde, y agrega fotos si puedes' },
  { t:'Consulta tus reportes', x:'. Verás cuándo se atiende y se cierra.' } ] });
const sInsig = (k) => ({ titulo:'Insignias y score', min:'1 min', intro:'Tu constancia se premia: cada logro desbloquea una insignia.', pasos:[ P('Abre "Insignias"', k+'/insignias.webp'), { t:'Revisa qué logros te faltan', x:' y qué debes hacer para conseguirlos.' } ] });

const faqComun = [
  { q:'Olvidé mi contraseña, ¿qué hago?', a:'Avisa a Recursos Humanos. Ellos generan una nueva desde el sistema y te la hacen llegar. No la compartas con nadie.' },
  { q:'No me aparece el código de seguridad', a:'Abre tu aplicación de códigos y busca "Bio-centralis". Si no la tienes configurada, pide a Recursos Humanos que reinicien tu acceso.' },
  { q:'Se me olvidó registrar mi entrada', a:'Regístrala en cuanto lo recuerdes y avisa a tu supervisor para que lo tenga en cuenta.' },
  { q:'¿Para qué piden mis datos?', a:'Solo los necesarios para tu nómina, tu seguridad y tu operación diaria. Se usan dentro de la empresa y nadie ajeno los ve.' },
];
const datosComun = [
  { dato:'Nombre, puesto y área', para:'Para saber quién eres y mostrarte solo lo que corresponde a tu trabajo.' },
  { dato:'Correo', para:'Es tu usuario para entrar y donde llegan tus avisos.' },
  { dato:'Hora y lugar de tu entrada/salida', para:'Para calcular tu puntualidad, tus puntos y el reto del equipo.' },
  { dato:'Teléfono y contacto de emergencia', para:'Para localizarte o avisar a alguien de confianza si pasa algo.' },
];
const bienv = { titulo:'Tu primera vez: la pantalla de bienvenida', min:'1 min', intro:'La primera vez que entras te preguntamos tres cosas rápidas.', pasos:[
  { t:'Área', x:'. Dónde trabajas, para mostrarte lo que te toca.' },
  { t:'Bio-Nave u oficina', x:'. Para registrar tu asistencia en el lugar correcto.' },
  { t:'Funciones principales', x:'. Para entender qué haces y ayudarte mejor.' } ] };

const perfiles = {};
// ── Operativo (chofer)
perfiles.chofer = { titulo:'Operativo', resumen:'Tu herramienta del día a día: asistencia, tu unidad, tus rutas y reportes de mantenimiento.',
  puedes:['Registrar entrada y salida','Ver tu unidad asignada','Llenar el checklist de tu unidad','Pedir mantenimiento o lavado','Ver tus rutas y servicios del día','Hacer solicitudes (permisos, material)','Reportar riesgos de seguridad','Ganar insignias y puntos'],
  nopuedes:['Datos de otros compañeros','Finanzas y nómina','Documentos de la empresa'],
  datos:[...datosComun, { dato:'Kilometraje y fotos de tu unidad', para:'Para llevar el control de mantenimiento y cuidar tu seguridad en carretera.' }],
  secciones:[ sEntrar(), bienv, sAsis('chofer'),
    { titulo:'Tu unidad y su checklist diario', min:'3 min', intro:'Antes de salir revisa tu unidad. Es rápido y evita problemas en ruta.', pasos:[
      P('Abre "Mi unidad"','chofer/flota.webp','Ahí ves tu unidad asignada.'),
      P('Abre "Mantenimiento"','chofer/mantenimiento.webp'),
      { t:'Toca "Llenar checklist" y responde cada punto', x:'. Si algo falla, márcalo y agrega foto.' },
      { t:'Pide servicio si hace falta', x:'. Toca "Solicitar mantenimiento" y describe lo que notas.' } ], tip:'Un checklist completo cada día suma puntos y te da la insignia "Unidad impecable".' },
    { titulo:'Tus rutas y servicios del día', min:'3 min', intro:'Ve a dónde vas, qué recoger y con quién.', pasos:[
      P('Abre "Rutas"','chofer/rutas.webp'),
      { t:'Revisa tu ruta del día', x:'. Cada servicio muestra cliente, dirección y tu avance.' },
      { t:'Toca "Ver servicios"', x:' para abrir cada parada y registrar llegada, fotos y firma del cliente.' },
      { t:'Al terminar, tu avance se actualiza solo' } ] },
    sSolicOK('chofer','Si es un permiso, tu supervisor lo revisa primero y después Recursos Humanos.'), sSeg('chofer'), sInsig('chofer'), sMuro('chofer'), sPerfil('chofer') ],
  faq:[ ...faqComun, { q:'Mi unidad no aparece', a:'Avisa a tu supervisor: puede que aún no te la hayan asignado.' } ] };
// ── Ayudante general
perfiles.ayudante = { titulo:'Ayudante general', resumen:'Lo esencial para tu jornada: asistencia, rutas, solicitudes y seguridad.',
  puedes:['Registrar entrada y salida','Ver las rutas donde participas','Hacer solicitudes','Reportar riesgos','Ganar insignias y puntos'],
  nopuedes:['Mantenimiento de unidades','Datos de otros compañeros','Finanzas'],
  datos:datosComun,
  secciones:[ sEntrar(), bienv, sAsis('ayudante'),
    { titulo:'Tus rutas', min:'2 min', intro:'Consulta con quién y a dónde vas hoy.', pasos:[ P('Abre "Rutas"','ayudante/rutas.webp'), { t:'Revisa tu ruta y los servicios del día' }, { t:'Acompaña a tu operador', x:'. Él registra las llegadas y firmas; tú ves el avance.' } ] },
    sSolicOK('ayudante','Tu supervisor recibe tus solicitudes primero.'), sSeg('ayudante'), sInsig('ayudante'), sMuro('ayudante'), sPerfil('ayudante') ],
  faq:faqComun };
// ── Supervisor
perfiles.supervisor = { titulo:'Gerente Operativo', resumen:'Vigila a tu equipo: asistencia, solicitudes, flota, rutas y seguridad en un solo lugar.',
  puedes:['Ver la asistencia de tu equipo','Aprobar o rechazar solicitudes','Ver flota y mantenimiento','Dar seguimiento a rutas y servicios','Revisar reportes de seguridad','Consultar personal y documentos'],
  nopuedes:['Configuración del sistema','Auditoría'],
  datos:[...datosComun, { dato:'Datos del personal a tu cargo', para:'Para organizar turnos, permisos y la operación.' }],
  secciones:[ sEntrar(), sAsis('supervisor'),
    { titulo:'Asistencia de tu equipo', min:'3 min', intro:'Quién llegó, quién llegó tarde y quién falta.', pasos:[ P('Abre "Asistencias"','supervisor/asistencias.webp'), { t:'Elige la fecha', x:' y revisa el estado de cada persona.' }, { t:'Detecta retardos y faltas', x:' para hablar con el equipo a tiempo.' } ] },
    { titulo:'Aprobar solicitudes y permisos', min:'3 min', intro:'Tu equipo te pide permisos y material; tú decides.', pasos:[ P('Abre "Solicitudes"','supervisor/solicitudes.webp'), { t:'Abre una solicitud pendiente' }, { t:'Aprueba o rechaza', x:' y, si rechazas, escribe el motivo.' } ], tip:'Responder rápido evita que tu equipo se quede esperando.' },
    { titulo:'Flota y mantenimiento', min:'3 min', intro:'El estado de las unidades.', pasos:[ P('Abre "Flota"','supervisor/flota.webp'), P('Abre "Mantenimiento"','supervisor/mantenimiento.webp'), { t:'Atiende los informes de las unidades', x:' que tus operadores reportan.' } ] },
    { titulo:'Rutas y servicios', min:'2 min', intro:'Cumplimiento del día.', pasos:[ P('Abre "Rutas"','supervisor/rutas.webp'), { t:'Revisa avance y pendientes de cada ruta' } ] },
    sSeg('supervisor'), sMuro('supervisor'), sPerfil('supervisor') ],
  faq:faqComun };
// ── RH
perfiles.rh = { titulo:'Recursos Humanos', resumen:'Altas, expedientes, asistencia, solicitudes y accesos del personal.',
  puedes:['Dar de alta y editar personal','Ver y capturar asistencia','Aprobar solicitudes','Generar accesos y reiniciar contraseñas','Ver compliance y reportes','Crear el reto semanal'],
  nopuedes:['Finanzas'],
  datos:[...datosComun, { dato:'CURP, RFC, ingreso y contrato', para:'Para el expediente y la nómina de cada colaborador.' }],
  secciones:[ sEntrar(),
    { titulo:'Personal y expedientes', min:'4 min', intro:'Aquí vive la información de cada colaborador.', pasos:[ P('Abre "Personal"','rh/personal.webp'), { t:'Busca a la persona o toca "Nuevo"' }, { t:'Completa sus datos y documentos', x:'. Se piden para su expediente y nómina.' } ] },
    { titulo:'Asistencia del equipo', min:'3 min', intro:'Control diario y por equipo.', pasos:[ P('Abre "Asistencias"','rh/asistencias.webp'), P('Abre "Asistencia de equipo"','rh/equipoasis.webp'), { t:'Crea el reto semanal', x:' y elige a qué tipo de personal y área aplica.' } ] },
    { titulo:'Solicitudes', min:'3 min', intro:'Revisa y resuelve lo que llega.', pasos:[ P('Abre "Solicitudes"','rh/solicitudes.webp'), { t:'Abre una pendiente y aprueba o rechaza' } ] },
    { titulo:'Accesos y contraseñas', min:'2 min', intro:'Cuando alguien olvide su contraseña, tú se la restableces desde el sistema.', pasos:[ { t:'Busca a la persona en Personal' }, { t:'Genera su nuevo acceso desde su ficha' }, { t:'Compártelo solo con esa persona' } ], tip:'Nunca guardes contraseñas en chats ni notas.' },
    { titulo:'Compliance y reportes', min:'3 min', intro:'Vigencia de documentos e indicadores.', pasos:[ P('Abre "Compliance"','rh/compliance.webp'), P('Abre "Reportes"','rh/reportes.webp') ] },
    sSeg('rh'), sMuro('rh'), sPerfil('rh') ],
  faq:faqComun };
// ── Dirección
perfiles.direccion_ceo = { titulo:'Dirección', resumen:'Visión completa de la empresa y control de todos los módulos.',
  puedes:['Ver todos los módulos','Cambiar de vista para ver como otro perfil','Consultar finanzas y KPIs','Revisar auditoría','Configurar la empresa'],
  nopuedes:[],
  datos:datosComun,
  secciones:[ sEntrar(),
    { titulo:'Tablero principal', min:'2 min', intro:'El resumen del día.', pasos:[ P('Abre "Dashboard"','direccion/dashboard.webp'), { t:'Revisa alertas y cifras clave' } ] },
    { titulo:'Ver como otro perfil', min:'2 min', intro:'Para saber qué ve cada persona de tu equipo.', pasos:[ { t:'Usa el selector "Vista"', x:' en la parte superior.' }, { t:'Elige el perfil', x:' y recorre sus pantallas. Vuelve a Dirección cuando termines.' } ] },
    { titulo:'Indicadores y finanzas', min:'3 min', intro:'Cómo va el negocio.', pasos:[ P('Abre "KPIs"','direccion/kpis.webp'), P('Abre "Finanzas"','direccion/finanzas.webp') ] },
    { titulo:'Personal, asistencia y solicitudes', min:'3 min', intro:'Control de la gente.', pasos:[ P('Abre "Personal"','direccion/personal.webp'), P('Abre "Asistencias"','direccion/asistencias.webp'), P('Abre "Solicitudes"','direccion/solicitudes.webp') ] },
    { titulo:'Auditoría y configuración', min:'2 min', intro:'Quién hizo qué, y ajustes generales.', pasos:[ P('Abre "Auditoría"','direccion/auditoria.webp'), P('Abre "Configuración"','direccion/configuracion.webp') ] },
    sMuro('direccion'), sPerfil('direccion') ],
  faq:faqComun };
// ── Mantenimiento
perfiles.mantenimiento = { titulo:'Mantenimiento', resumen:'Atiende los informes y servicios de las unidades.',
  puedes:['Ver informes de las unidades','Atender solicitudes de mantenimiento'],
  nopuedes:['Personal, finanzas y rutas'],
  datos:datosComun,
  secciones:[ sEntrar(),
    { titulo:'Atender mantenimiento', min:'3 min', intro:'Lo que los operadores reportan llega a ti.', pasos:[ P('Abre "Mantenimiento"','mantenimiento/mantenimiento.webp'), { t:'Revisa los informes recientes y su nivel de urgencia' }, { t:'Atiende la unidad y deja registro de lo realizado' } ] },
    sPerfil('mantenimiento') ],
  faq:faqComun };
// ── Monitoreo
perfiles.monitoreo = { titulo:'Monitoreo', resumen:'Vigila la flota y la operación en tiempo real.',
  puedes:['Ver flota y equipos','Consultar documentos','Registrar asistencia','Hacer solicitudes','Reportar riesgos'],
  nopuedes:['Finanzas','Personal'],
  datos:datosComun,
  secciones:[ sEntrar(), sAsis('monitoreo'),
    { titulo:'Flota y equipos', min:'3 min', intro:'Estado de unidades y equipos.', pasos:[ P('Abre "Flota"','monitoreo/flota.webp'), P('Abre "Equipos"','monitoreo/equipos.webp') ] },
    { titulo:'Documentos', min:'2 min', intro:'Consulta los documentos vigentes.', pasos:[ P('Abre "Documentos"','monitoreo/documentos.webp') ] },
    sSolicOK('monitoreo'), sSeg('monitoreo'), sMuro('monitoreo'), sPerfil('monitoreo') ],
  faq:faqComun };
// ── Administrativo operativo / finanzas
const admin = (k, area) => ({ titulo:'Administrativo · '+area, resumen:'Apoyo administrativo de tu área.',
  puedes:['Registrar asistencia','Hacer solicitudes','Consultar calendario y procesos', ...(k==='finanzas'?['Consultar finanzas']:['Ver flota, rutas y documentos'])],
  nopuedes: k==='finanzas'?['Flota y rutas']:['Finanzas'],
  datos:datosComun,
  secciones:[ sEntrar(), sAsis(k),
    { titulo:'Calendario y procesos', min:'2 min', intro:'Fechas importantes y los pasos de cada proceso.', pasos:[ P('Abre "Calendario"',k+'/calendario.webp'), P('Abre "Procesos"',k+'/procesos.webp') ] },
    ...(k==='finanzas'?[{ titulo:'Finanzas', min:'3 min', intro:'Consulta y da seguimiento.', pasos:[ P('Abre "Finanzas"','finanzas/finanzas.webp') ] }]:[{ titulo:'Flota, rutas y documentos', min:'3 min', intro:'Consulta lo que necesitas para tu trabajo.', pasos:[ P('Abre "Flota"','administrativo/flota.webp'), P('Abre "Rutas"','administrativo/rutas.webp'), P('Abre "Documentos"','administrativo/documentos.webp') ] }]),
    sSolicOK(k), sMuro(k), sPerfil(k) ],
  faq:faqComun });
perfiles.administrativo_operativa = admin('administrativo','operativa');
perfiles.administrativo_finanzas = admin('finanzas','finanzas');
// ── Administración
perfiles.administracion = { titulo:'Gerente Administrativo', resumen:'Finanzas, procesos y calendario de la empresa.',
  puedes:['Consultar y aprobar finanzas','Ver calendario y procesos','Registrar asistencia','Hacer solicitudes'],
  nopuedes:['Flota y rutas'],
  datos:datosComun,
  secciones:[ sEntrar(), sAsis('administracion'),
    { titulo:'Finanzas', min:'3 min', intro:'Revisa y da seguimiento.', pasos:[ P('Abre "Finanzas"','administracion/finanzas.webp') ] },
    { titulo:'Calendario y procesos', min:'2 min', intro:'Fechas y procesos.', pasos:[ P('Abre "Calendario"','administracion/calendario.webp'), P('Abre "Procesos"','administracion/procesos.webp') ] },
    sSolicOK('administracion'), sMuro('administracion'), sPerfil('administracion') ],
  faq:faqComun };
// ── SHE
perfiles.she = { titulo:'Seguridad, Salud y Ambiente', resumen:'Atiende los reportes de seguridad y da seguimiento hasta cerrarlos.',
  puedes:['Ver y atender reportes de seguridad','Cerrar reportes con acción correctiva','Registrar asistencia','Hacer solicitudes'],
  nopuedes:['Finanzas','Personal'],
  datos:datosComun,
  secciones:[ sEntrar(), sAsis('she'),
    { titulo:'Atender reportes de seguridad', min:'4 min', intro:'Todo lo que el equipo reporta llega aquí.', pasos:[ P('Abre "Seguridad"','she/seguridad.webp'), { t:'Revisa el semáforo y las fotos' }, { t:'Define la acción correctiva' }, { t:'Cierra el reporte cuando esté resuelto' } ] },
    sSolicOK('she'), sMuro('she'), sPerfil('she') ],
  faq:faqComun };

const salida = { version: VERSION, novedades, perfiles };
fs.writeFileSync(__dirname + '/../../manual/manual.json', JSON.stringify(salida, null, 1));
console.log('manual.json', Object.keys(perfiles).length, 'perfiles');
// Lista de capturas necesarias (perfil/pagina)
const imgs = new Set(); JSON.stringify(perfiles, (k,v)=>{ if (k==='img' && v) imgs.add(v); return v; });
fs.writeFileSync(__dirname + '/capturas.lista.json', JSON.stringify([...imgs].sort(), null, 1));
console.log(imgs.size, 'capturas');
