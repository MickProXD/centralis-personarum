// Datos de DEMOSTRACIÓN para las capturas del manual. Nada es real: personas, unidades y cifras son inventadas.
const hoy = new Date(); const iso = d => d.toISOString().slice(0,10);
const dia = n => { const d = new Date(hoy); d.setDate(d.getDate()+n); return iso(d); };
const ts = (n, h, m) => { const d = new Date(hoy); d.setDate(d.getDate()+n); d.setHours(h, m, 0, 0); return d.toISOString(); };
const U = id => `00000000-0000-4000-8000-${String(id).padStart(12,'0')}`;

const NAVE1 = U(101), NAVE2 = U(102), SITE1 = U(201);
const personas = [
  ['Luis Alberto Ramírez Cruz','Operador','operador'], ['Miguel Ángel Torres Vega','Operador','operador'],
  ['Carlos Eduardo Mendoza Ruiz','Ayudante general','ayudante_general'], ['José Antonio Salinas Mora','Ayudante general','ayudante_general'],
  ['Fernando Javier Ortega Luna','Operador','operador'], ['Ricardo Daniel Herrera Soto','Mecánico',null],
  ['Ana Patricia Villanueva Ríos','Administrativo',null], ['Laura Elena Domínguez Paz','Recursos Humanos',null],
  ['Roberto Carlos Aguilar Peña','Supervisor',null], ['Sofía Alejandra Navarro Gil','Monitorista',null],
].map((p,i)=>({ id:U(300+i), nombre:p[0], puesto:p[1], perfil_operativo:p[2], estatus:'activo', site_id:SITE1, bio_nave_id:NAVE1, area_id:null, curp:'XXXX000000HDFXXX00', rfc:'XXXX000000XX0', ingreso:'2023-03-15', contrato_tipo:'Indeterminado', turno:'Matutino', tel:'55 0000 0000', emerg:'55 1111 1111', unidad_id:null, fecha_nacimiento:'1990-05-12' }));
const unidades = Array.from({length:8},(_,i)=>({ id:U(400+i), bak:`BAK-${String(i+1).padStart(2,'0')}`, niv:`3ALDEMO0000${1000+i}`, placas:`DEM-${100+i}`, marca:'Freightliner', modelo:'M2 106', anio:2021, tipo:'Recolector', jurisdiccion:'Federal', bio_nave_id:NAVE1, estatus:'Operativa', chofer_id: i<2 ? personas[i].id : null }));
personas[0].unidad_id = unidades[0].id; personas[1].unidad_id = unidades[1].id;

const naves = [{ id:NAVE1, nombre:'Bio-Nave 1', direccion:'Congreso de la Unión 6724, CDMX', capacidad:20, pendiente:false },{ id:NAVE2, nombre:'Bio-Nave 2', direccion:'Congreso de la Unión 6724, CDMX', capacidad:20, pendiente:false }];
const sites = [{ id:SITE1, nombre:'Planta Norte', direccion:'Ecatepec, Edo. Méx.', tipo:'Operativa', owner_id:null, created_at:ts(-90,9,0), lat:null, lng:null }];

const asistencias = []; // el propio colaborador: últimos días
for (let n=-8; n<=0; n++){ const d = new Date(hoy); d.setDate(d.getDate()+n); if (d.getDay()===0) continue;
  const est = ['puntual','puntual','precaucion','puntual','retardo','puntual','puntual','puntual','puntual'][(n+8)%9];
  asistencias.push({ id:U(900+n+20), fecha:dia(n), colaborador_id:personas[0].id, tipo:'P', capturado_por:null, created_at:ts(n,7,55), hora_entrada:ts(n,7,est==='retardo'?20:est==='precaucion'?5:55), hora_salida: n<0 ? ts(n,17,2) : null, estado_puntualidad:est, minutos_retraso:est==='retardo'?20:0, origen:'qr', distancia_m:12 });
}
module.exports = { U, NAVE1, NAVE2, SITE1, personas, unidades, naves, sites, asistencias, dia, ts, iso, hoy };

const P=personas, UN=unidades;
const extras = {
  solicitudes_op:[
    { id:U(500), tipo:'permiso', solicitante:null, colaborador_id:P[0].id, unidad_id:null, detalle:'Permiso de un día por trámite personal', datos:{}, aprobador:'supervisor', estatus:'pendiente', created_at:ts(-1,10,0), solicitante_nombre:P[0].nombre, evidencia:[], goce_sueldo:true, etapa:'supervisor', etapa_en:ts(-1,10,0) },
    { id:U(501), tipo:'material', solicitante:null, colaborador_id:P[1].id, unidad_id:UN[1].id, detalle:'Guantes y chaleco nuevos', datos:{}, aprobador:'supervisor', estatus:'aprobada', created_at:ts(-4,9,0), solicitante_nombre:P[1].nombre, evidencia:[], goce_sueldo:null, etapa:'resuelta', etapa_en:ts(-3,9,0) },
    { id:U(502), tipo:'vacaciones', solicitante:null, colaborador_id:P[4].id, unidad_id:null, detalle:'Vacaciones del 14 al 18', datos:{}, aprobador:'rh', estatus:'pendiente', created_at:ts(-2,12,0), solicitante_nombre:P[4].nombre, evidencia:[], goce_sueldo:true, etapa:'rh', etapa_en:ts(-2,12,0) }],
  mant_informes:[{ id:U(510), unidad_id:UN[0].id, chofer_user:null, colaborador_id:P[0].id, fecha:dia(-2), checklist:{ luces:'ok', llantas:'ok', frenos:'atencion' }, nivel:'precaucion', observaciones:'Se escucha un ruido leve al frenar', fotos:[], odometro:48210, vence_respuesta:ts(1,9,0), created_at:ts(-2,8,0), chofer_nombre:P[0].nombre }],
  lavados_programados:[{ id:U(520), unidad_id:UN[0].id, colaborador_id:P[0].id, chofer_user:null, chofer_nombre:P[0].nombre, fecha_programada:dia(1), notas:'Lavado general', estado:'programado', created_at:ts(-1,9,0) }],
  publicaciones:[
    { id:U(530), autor_id:null, autor_nombre:'Recursos Humanos', categoria:'aviso', contenido:'¡Bienvenidos! Recuerden registrar su entrada todos los días desde la app.', fijado:true, created_at:ts(-3,9,0), imagenes:[] },
    { id:U(531), autor_id:null, autor_nombre:'Dirección', categoria:'reconocimiento', contenido:'Felicidades al equipo de la Nave 1 por una semana sin retardos 🎉', fijado:false, created_at:ts(-1,16,0), imagenes:[] }],
  she_reportes:[{ id:U(540), folio:'SHE-0001', tipo:'condicion_insegura', semaforo:'amarillo', descripcion:'Piso mojado en acceso a la bodega', lugar:'Bodega Nave 1', site_id:SITE1, bio_nave_id:NAVE1, fotos:[], hubo_lesionados:false, reportado_por_nombre:P[2].nombre, estatus:'abierto', created_at:ts(-2,11,0) }],
  ordenes_servicio:[
    { id:U(550), folio:'OS-1001', estado:'programada', origen:'manual', fecha:dia(0), hora:'09:00', cliente_nombre:'Cliente Demo, S.A.', direccion:'Av. Ejemplo 123, CDMX', ruta_nombre:'Ruta Norte', tipos:['Residuos peligrosos'], volumen:'1.2 t', operador_id:P[0].id, operador_nombre:P[0].nombre, ayudante1:P[2].nombre, unidad_id:UN[0].id, created_at:ts(-1,9,0) },
    { id:U(551), folio:'OS-1002', estado:'completada', origen:'manual', fecha:dia(0), hora:'12:00', cliente_nombre:'Industrias Demo', direccion:'Calle Muestra 45, Edo. Méx.', ruta_nombre:'Ruta Norte', tipos:['Residuos especiales'], volumen:'800 kg', operador_id:P[0].id, operador_nombre:P[0].nombre, unidad_id:UN[0].id, created_at:ts(-1,9,0), completada_at:ts(0,11,0) }],
  bg_checklists:[{ id:U(560), unidad_id:UN[0].id, chofer_nombre:P[0].nombre, colaborador_id:P[0].id, fecha:dia(0), respuestas:{}, fallas:0, odometro:48250, foto_path:'x', created_at:ts(0,7,30) }],
};
module.exports.extras = extras;
