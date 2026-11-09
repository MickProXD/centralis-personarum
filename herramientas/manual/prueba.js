const { abrir } = require('./harness'); const D=require('./demo'); const S='/tmp/claude-0/-home-claude/ce4a2c74-45ba-57fd-8e31-b90922c32c3a/scratchpad/';
const lun = new Date(D.hoy); lun.setDate(lun.getDate()-((lun.getDay()+6)%7));
const rows=[{ id:D.U(3001), fecha:D.iso(lun), colaborador_id:D.personas[0].id, tipo:'P', created_at:new Date().toISOString(), nota:'Llegó tarde por bloqueo en Periférico', origen:'gerente' },
 { id:D.U(3002), fecha:D.iso(lun), colaborador_id:D.personas[1].id, tipo:'F', created_at:new Date().toISOString(), origen:'sistema' }];
(async()=>{ const { pg, log, cerrar } = await abrir('rh',{ancho:1280,alto:800,extra:{tablas:{asistencias:rows}}});
 await pg.evaluate(()=>nav('asistencias',null)); await pg.waitForTimeout(1800);
 await pg.screenshot({path:S+'asis_nota.png',clip:{x:380,y:290,width:640,height:130}});

 const k = await pg.evaluate(()=>Object.keys(DB.asistencias).find(k=>DB.asistencias[k].origen==='sistema'));
 await pg.evaluate(([f,c])=>abrirAsistencia(c,f),[k.slice(0,10),k.slice(11)]); await pg.waitForTimeout(700); await pg.screenshot({path:S+'asis_auto.png'});
 const [d] = await Promise.all([pg.waitForEvent('download',{timeout:20000}), pg.evaluate('descargarAsistenciaPDF()')]); await d.saveAs(S+'tn.pdf');
 console.log(log.slice(0,5)); await cerrar(); })();
