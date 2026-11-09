// Genera las capturas del manual (datos ficticios) en manual/img/<perfil>/<pagina>.webp. Uso: node capturas.js [perfil]
const { abrir } = require('./harness'); const fs = require('fs'); const { execFileSync } = require('child_process');
const lista = require('./capturas.lista.json'); const OUT = __dirname + '/../../manual/img/'; const TMP = '/tmp/capman/';
(async()=>{ fs.mkdirSync(TMP,{recursive:true}); const solo = process.argv[2]; const por = {};
 lista.forEach(i => { const [k, p] = i.replace('.webp','').split('/'); if (!solo || solo===k) (por[k] = por[k] || []).push(p); });
 for (const k of Object.keys(por)){ const movil = ['chofer','ayudante','mantenimiento'].includes(k);
  const { pg, cerrar } = await abrir(k, { movil, ancho: movil?390:1280, alto: movil?780:800 }); fs.mkdirSync(OUT+k,{recursive:true});
  for (const p of por[k]){ try { await pg.evaluate(x => { try{cerrarMenuMovil();}catch(e){} nav(x, null); }, p); await pg.waitForTimeout(1200);
    const png = `${TMP}${k}__${p}.png`; await pg.screenshot({ path: png });
    execFileSync('python3',['-c',`from PIL import Image;im=Image.open('${png}').convert('RGB');im.save('${OUT}${k}/${p}.webp','WEBP',quality=78,method=6)`]); } catch(e){ console.log('fallo', k, p, e.message.slice(0,80)); } }
  await cerrar(); }
 console.log('listo'); })();
