const { abrir } = require('./harness');
(async()=>{ const { pg, log, cerrar } = await abrir('rh',{ancho:1280,alto:800}); await pg.waitForTimeout(3000);
 console.log(await pg.evaluate(()=>typeof verIniciar+' '+(window._verIniciado||false)), log.slice(0,5)); await cerrar(); })();
