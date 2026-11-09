// Recorre todas las páginas de un perfil y guarda una captura por página (para decidir qué se muestra en el manual)
const { abrir } = require('./harness'); const fs = require('fs');
const OUT = process.argv[3] || '/tmp/claude-0/-home-claude/ce4a2c74-45ba-57fd-8e31-b90922c32c3a/scratchpad/exp/';
(async()=>{ const k = process.argv[2]; const movil = ['chofer','ayudante','mantenimiento'].includes(k); fs.mkdirSync(OUT,{recursive:true});
 const { pg, log, cerrar } = await abrir(k, { movil, ancho:1280, alto:800 });
 const pags = await pg.evaluate(() => caps().pages);
 for (const p of pags){ try { await pg.evaluate(x => { cerrarMenuMovil && cerrarMenuMovil(); nav(x, null); }, p); await pg.waitForTimeout(1300); await pg.screenshot({ path: `${OUT}${k}__${p}.png` }); } catch(e){ console.log('fallo', p, e.message.slice(0,80)); } }
 console.log(k, pags.length, 'páginas', log.slice(0,3)); await cerrar(); })();
