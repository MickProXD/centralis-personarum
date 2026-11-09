// Arranca la app con un servidor local y datos de demostración (sin tocar Supabase real). Uso: const { abrir } = require('./harness')
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const D = require('./demo');
const RAIZ = path.resolve(__dirname, '../..');
const REF = 'csjvexyodhoirjimjwrb';
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64').replace(/=+$/,'').replace(/\+/g,'-').replace(/\//g,'_');

function servidor(){
  return new Promise(res => { const s = http.createServer((q, r) => { let f = path.join(RAIZ, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
    fs.readFile(f, (e, d) => { if (e){ r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html; charset=utf-8' : f.endsWith('.json') ? 'application/json' : f.endsWith('.png') ? 'image/png' : 'application/octet-stream' }); r.end(d); } }); });
    s.listen(0, '127.0.0.1', () => res(s)); });
}
const PERFILES = {
  chofer:        { nombre:'Luis Alberto Ramírez Cruz',   role:'chofer',        colab:0 },
  ayudante:      { nombre:'Carlos Eduardo Mendoza Ruiz', role:'chofer',        colab:2 },
  supervisor:    { nombre:'Roberto Carlos Aguilar Peña', role:'supervisor',    colab:8 },
  rh:            { nombre:'Laura Elena Domínguez Paz',   role:'rh',            colab:7 },
  direccion:     { nombre:'Director de Demostración',    role:'direccion_ceo', colab:null },
  mantenimiento: { nombre:'Ricardo Daniel Herrera Soto', role:'mantenimiento', colab:5 },
  monitoreo:     { nombre:'Sofía Alejandra Navarro Gil', role:'monitoreo',     colab:9 },
  administrativo:{ nombre:'Ana Patricia Villanueva Ríos',role:'administrativo',colab:6, area_admin:'operativa' },
  finanzas:      { nombre:'Ana Patricia Villanueva Ríos',role:'administrativo',colab:6, area_admin:'finanzas' },
  administracion:{ nombre:'Gerente Administrativo Demo', role:'administracion',colab:null },
  she:           { nombre:'Especialista SHE Demo',       role:'she',           colab:null },
};
async function abrir(clave, { ancho = 1280, alto = 800, movil = false, extra = {} } = {}){
  const p = PERFILES[clave]; const srv = await servidor(); const base = `http://127.0.0.1:${srv.address().port}`;
  const uid = D.U(1000 + Object.keys(PERFILES).indexOf(clave));
  const perfil = { id:uid, usuario:'demo', nombre:p.nombre, correo_contacto:'demo@ejemplo.mx', role:p.role, area_id:null, bio_nave_id:D.NAVE1, site_id:D.SITE1, colaborador_id: p.colab==null ? null : D.personas[p.colab].id, gerente_id:null, area_admin:p.area_admin||null, activo:true, tour_completado:true, foto_invitada:true, cuestionario_completado:true, area_id:null, debe_cambiar_password:false, created_at:D.ts(-120,9,0) };
  const nav = await chromium.launch();
  const ctx = await nav.newContext(movil ? { viewport:{ width:390, height:780 }, deviceScaleFactor:2, hasTouch:true, isMobile:true } : { viewport:{ width:ancho, height:alto }, deviceScaleFactor:2 });
  const exp = Math.floor(Date.now()/1000) + 36000;
  const jwt = [b64u({alg:'HS256',typ:'JWT'}), b64u({ aud:'authenticated', exp, sub:uid, role:'authenticated', aal:'aal2', amr:[{method:'totp',timestamp:exp-100}], session_id:D.U(7777), email:'demo@ejemplo.mx' }), 'ZmlybWFkbw'].join('.');
  const user = { id:uid, aud:'authenticated', role:'authenticated', email:'demo@ejemplo.mx', app_metadata:{}, user_metadata:{}, created_at:D.ts(-120,9,0), factors:[] };
  const sesion = { access_token:jwt, refresh_token:'demo', expires_in:36000, expires_at:exp, token_type:'bearer', user };
  await ctx.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); localStorage.setItem('pwa_ok','1'); localStorage.setItem('manual_demo','1'); } catch(e){} }, [`sb-${REF}-auth-token`, JSON.stringify(sesion)]);
  const tablas = Object.assign({ profiles:[perfil], colaboradores:D.personas, unidades:D.unidades, bio_naves:D.naves, sites:D.sites, asistencias:D.asistencias, horarios_asistencia:[{ id:D.U(1), colaborador_id:null, hora_entrada:'08:00:00', hora_salida:'17:00:00', tolerancia_min:10, limite_precaucion_min:15, dias:[1,2,3,4,5,6], entradas_dia:{}, salidas_dia:{} }], configuracion:[{ id:1, empresa:'BIOAMBIENTALISTIK', rfc:'', resp:'Dirección', d1:30, d2:15, d3:7 }] }, D.extras, extra.tablas || {});
  const pg = await ctx.newPage(); const log = [];
  pg.on('pageerror', e => log.push('pageerror: ' + e.message));
  await pg.route('**/*', async route => {
    const u = new URL(route.request().url()); const m = route.request().method();
    if (u.hostname === '127.0.0.1') return route.continue();
    if (u.hostname.endsWith('supabase.co')){
      const h = { 'access-control-allow-origin':'*', 'access-control-allow-headers':'*', 'access-control-expose-headers':'content-range' };
      if (m === 'OPTIONS') return route.fulfill({ status:204, headers:h });
      if (u.pathname.startsWith('/auth/v1/user')) return route.fulfill({ status:200, headers:{...h,'content-type':'application/json'}, body:JSON.stringify(user) });
      if (u.pathname.startsWith('/auth/v1/token')) return route.fulfill({ status:200, headers:{...h,'content-type':'application/json'}, body:JSON.stringify(sesion) });
      if (u.pathname.startsWith('/auth/v1/')) return route.fulfill({ status:200, headers:{...h,'content-type':'application/json'}, body:'[]' });
      if (u.pathname.startsWith('/rest/v1/rpc/')){ const f = (extra.rpc||{})[u.pathname.split('/').pop()]; return route.fulfill({ status:200, headers:{...h,'content-type':'application/json'}, body:JSON.stringify(f === undefined ? null : f) }); }
      if (u.pathname.startsWith('/rest/v1/')){
        const t = u.pathname.split('/').pop(); let rows = tablas[t]; if (typeof rows === 'function') rows = rows(u);
        rows = rows || []; const acc = route.request().headers()['accept'] || '';
        const hd = { ...h, 'content-type':'application/json', 'content-range': rows.length ? `0-${rows.length-1}/${rows.length}` : '*/0' };
        if (m === 'HEAD') return route.fulfill({ status:200, headers:hd, body:'' });
        if (m !== 'GET') return route.fulfill({ status:201, headers:hd, body:'[]' });
        if (acc.includes('vnd.pgrst.object')) return rows.length ? route.fulfill({ status:200, headers:hd, body:JSON.stringify(rows[0]) }) : route.fulfill({ status:406, headers:hd, body:JSON.stringify({ code:'PGRST116', message:'sin filas' }) });
        return route.fulfill({ status:200, headers:hd, body:JSON.stringify(rows) });
      }
      if (u.pathname.startsWith('/functions/v1/')) return route.fulfill({ status:200, headers:{...h,'content-type':'application/json'}, body:JSON.stringify(extra.fn || {}) });
      return route.fulfill({ status:404, headers:h, body:'{}' });
    }
    if (u.hostname.includes('fonts.')) return route.continue();
    return route.abort();
  });
  await pg.goto(base + '/index.html', { waitUntil:'domcontentloaded' });
  await pg.waitForFunction(() => document.getElementById('login-screen')?.style.display === 'none' && typeof currentUser !== 'undefined' && currentUser, null, { timeout:20000 }).catch(() => {});
  await pg.waitForTimeout(1500);
  return { pg, log, cerrar: async () => { await nav.close(); srv.close(); } };
}
module.exports = { abrir, PERFILES };
