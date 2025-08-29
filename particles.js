/* ----------------------------------------------------
   Fundo de partículas “tech HUD”
   - pontos animados com conexão por distância
   - pontos piscando aleatoriamente
   - linhas horizontais/verticais ocasionais (efeito de tela)
   - “scanline” suave em loop
-----------------------------------------------------*/
(() => {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d', { alpha: true });

  let w, h, dpr, particles, lines, lastTime;
  const MAX_LINK_DIST = 90;        // distância para traçar linhas entre pontos
  const DENSITY = 0.00003;          // densidade de partículas por px²
  const LINE_SPAWN_EVERY = 1600;    // ms para tentar spawnar uma linha de “tela”
  const SCANLINE_SPEED = 22;        // px/s
  const COLOR = 'rgba(114,182,255,';
  const DOT_COLOR = 'rgba(30,144,255,';
  let scanY = 0, lastLineSpawn = 0;

  const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ACTIVE = !rm; // se usuário prefere menos movimento, não anima

  function resize(){
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width  = Math.floor(innerWidth  * dpr);
    h = canvas.height = Math.floor(innerHeight * dpr);
    canvas.style.width  = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
    initParticles();
  }

  function initParticles(){
    const count = Math.floor(w * h * DENSITY);
    particles = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - .5) * 20,   // vel em px/s (antes do delta)
      vy: (Math.random() - .5) * 20,
      r:  1 + Math.random() * 1.4,
      tw: Math.random() * 2 * Math.PI, // para “piscar”
      tws: 1.5 + Math.random() * 1.2
    }));
    lines = [];
  }

  // Cria uma linha “de varredura” horizontal ou vertical
  function spawnHudLine(){
    const vertical = Math.random() < .5;
    if(vertical){
      const x = Math.random() * w;
      lines.push({ vertical:true, pos:x, life: 1200, width: 1 + Math.random()*1.5 });
    }else{
      const y = Math.random() * h;
      lines.push({ vertical:false, pos:y, life: 1200, width: 1 + Math.random()*1.5 });
    }
  }

  function step(ts){
    if(!lastTime) lastTime = ts;
    const dt = Math.min(64, ts - lastTime) / 1000; // segurança
    lastTime = ts;

    ctx.clearRect(0,0,w,h);

    // Partículas
    for(let p of particles){
      p.x += p.vx * dt * dpr;
      p.y += p.vy * dt * dpr;

      // bordas (teleporta)
      if(p.x < 0) p.x += w; else if(p.x > w) p.x -= w;
      if(p.y < 0) p.y += h; else if(p.y > h) p.y -= h;

      // brilho/piscar
      p.tw += p.tws * dt;
      const alpha = .35 + Math.sin(p.tw) * .25;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = DOT_COLOR + (0.28 + alpha) + ')';
      ctx.fill();
    }

    // Conexões por proximidade (grid simples por blocos melhora perf)
    const cell = 80 * dpr;
    const grid = new Map();
    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      const gx = Math.floor(p.x / cell);
      const gy = Math.floor(p.y / cell);
      const key = gx + ',' + gy;
      (grid.get(key) || (grid.set(key, []), grid.get(key))).push(i);
    }

    ctx.lineWidth = 1 * dpr;
    const keys = [...grid.keys()];
    for(const key of keys){
      const [gx, gy] = key.split(',').map(Number);
      const bucket = [];
      for(let ix=-1; ix<=1; ix++){
        for(let iy=-1; iy<=1; iy++){
          const nkey = (gx+ix)+','+(gy+iy);
          if(grid.has(nkey)) bucket.push(...grid.get(nkey));
        }
      }
      for(let i=0; i<bucket.length; i++){
        const a = particles[bucket[i]];
        for(let j=i+1; j<bucket.length; j++){
          const b = particles[bucket[j]];
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.hypot(dx,dy);
          if(dist < MAX_LINK_DIST * dpr){
            const o = 1 - dist/(MAX_LINK_DIST*dpr);
            ctx.strokeStyle = COLOR + (0.08 + o*0.18) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    }

    // Linhas HUD (h/v que aparecem e somem)
    if(ts - lastLineSpawn > LINE_SPAWN_EVERY){
      if(Math.random() < .6) spawnHudLine();
      lastLineSpawn = ts;
    }
    for(let i=lines.length-1;i>=0;i--){
      const L = lines[i];
      L.life -= dt*1000;
      if(L.life <= 0){ lines.splice(i,1); continue; }
      const al = Math.min(.18, L.life/1200*.18);
      ctx.save();
      ctx.globalAlpha = al;
      ctx.strokeStyle = 'rgba(30,144,255,1)';
      ctx.lineWidth = L.width * dpr;
      ctx.beginPath();
      if(L.vertical){
        ctx.moveTo(L.pos, 0); ctx.lineTo(L.pos, h);
      }else{
        ctx.moveTo(0, L.pos); ctx.lineTo(w, L.pos);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Scanline suave
    scanY += SCANLINE_SPEED * dpr * dt;
    if(scanY > h + 40*dpr) scanY = -40*dpr;
    const grad = ctx.createLinearGradient(0, scanY-20*dpr, 0, scanY+20*dpr);
    grad.addColorStop(0, 'rgba(30,144,255,0)');
    grad.addColorStop(.5,'rgba(30,144,255,0.09)');
    grad.addColorStop(1, 'rgba(30,144,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, scanY-20*dpr, w, 40*dpr);

    if(ACTIVE) requestAnimationFrame(step);
  }

  // Inicialização
  resize();
  window.addEventListener('resize', resize, { passive:true });

  if(ACTIVE) requestAnimationFrame(step);
})();
