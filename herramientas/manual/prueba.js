const { abrir } = require('./harness'); const S='/tmp/claude-0/-home-claude/ce4a2c74-45ba-57fd-8e31-b90922c32c3a/scratchpad/';
(async()=>{ const { pg, cerrar } = await abrir('supervisor',{ancho:1280,alto:800});
 await pg.evaluate(()=>nav('manual',null)); await pg.waitForTimeout(1500);
 await pg.evaluate(()=>{ document.querySelectorAll('.man-sec')[1].open=true; document.querySelectorAll('.man-sec')[1].scrollIntoView(); }); await pg.waitForTimeout(1200);
 await pg.screenshot({path:S+'man_sup2.png'}); await cerrar(); })();
