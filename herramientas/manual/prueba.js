const { abrir } = require('./harness'); const D=require('./demo'); const S='/tmp/claude-0/-home-claude/ce4a2c74-45ba-57fd-8e31-b90922c32c3a/scratchpad/';
const lun = new Date(D.hoy); lun.setDate(lun.getDate()-((lun.getDay()+6)%7));
const rows=[]; let n=0;
// persona i, minutos de retraso por semana (0=semana más antigua … 3=actual)
const plan={0:[0,0,0,0],1:[5,8,14,20],2:[25,18,6,0],3:[12,12,13,12]};
for (const i of Object.keys(plan)) plan[i].forEach((ret,w)=>{ for(let d=0; d<5; d++){ const f=new Date(lun); f.setDate(f.getDate()-(3-w)*7+d); if (f>D.hoy) continue;
  const base=8*60+ret-(ret===0?5:0); const dt=new Date(f.getFullYear(),f.getMonth(),f.getDate(),Math.floor(base/60),base%60);
  rows.push({ id:D.U(2000+n++), fecha:D.iso(f), colaborador_id:D.personas[i].id, tipo:'P', created_at:dt.toISOString(), hora_entrada:dt.toISOString(), hora_salida:null, estado_puntualidad: ret<=10?'puntual':ret<=15?'precaucion':'retardo', minutos_retraso:Math.max(0,ret-0), origen:'qr' }); } });
rows.push({ id:D.U(2999), fecha:D.iso(lun), colaborador_id:D.personas[4].id, tipo:'F', created_at:new Date().toISOString() });
(async()=>{ const { pg, log, cerrar } = await abrir('rh',{ancho:1280,alto:800,extra:{tablas:{asistencias:rows}}});
 await pg.evaluate(()=>nav('asistencias',null)); await pg.waitForTimeout(1500);
 for (const f of ['descargarAsistenciaXLS','descargarAsistenciaPDF']){
  const [d] = await Promise.all([pg.waitForEvent('download',{timeout:20000}), pg.evaluate(f+'()')]);
  await d.saveAs(S+'t_'+d.suggestedFilename()); console.log(d.suggestedFilename()); }
 console.log(log.slice(0,5)); await cerrar(); })();
