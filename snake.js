// snake.js — Snake Neo (smooth, skins, particles, swipe)
const cvs = document.getElementById("game");
const ctx = cvs.getContext("2d");
const eatSound = document.getElementById("eatSound");
const overSound = document.getElementById("gameOverSound");

const GRID = 20;               // tile size
const COLS = Math.floor(cvs.width/GRID);
const ROWS = Math.floor(cvs.height/GRID);

let snake, dir, nextDir, food, score, high, speed, loop, paused, skin, particles=[];

const scoreEl = document.getElementById("score");
const highEl  = document.getElementById("highscore");
const skinSel = document.getElementById("skin");
const startBtn= document.getElementById("startBtn");
const pauseBtn= document.getElementById("pauseBtn");

high = parseInt(localStorage.getItem("snake_neo_high")||"0",10);
highEl.textContent = "رکورد: " + high;

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", ()=> paused = !paused);
skinSel.addEventListener("change", ()=> drawStatic());

document.addEventListener("keydown", e=>{
  const k = e.key;
  if (k==="ArrowLeft"  && dir.x!== 1) nextDir = {x:-1,y:0};
  if (k==="ArrowRight" && dir.x!==-1) nextDir = {x: 1,y:0};
  if (k==="ArrowUp"    && dir.y!== 1) nextDir = {x:0,y:-1};
  if (k==="ArrowDown"  && dir.y!==-1) nextDir = {x:0,y: 1};
  if (k===" "){ paused = !paused; } // space pause
});

// Touch swipe for mobile
(function initSwipe(){
  let sx, sy, dx, dy, t=false;
  cvs.addEventListener("touchstart", e=>{ const p=e.changedTouches[0]; sx=p.clientX; sy=p.clientY; t=true; });
  cvs.addEventListener("touchend",   e=>{ if(!t) return; const p=e.changedTouches[0]; dx=p.clientX-sx; dy=p.clientY-sy;
    if(Math.abs(dx)>Math.abs(dy)){
      if(dx<-20 && dir.x!== 1) nextDir={x:-1,y:0};
      if(dx> 20 && dir.x!==-1) nextDir={x: 1,y:0};
    }else{
      if(dy<-20 && dir.y!== 1) nextDir={x:0,y:-1};
      if(dy> 20 && dir.y!==-1) nextDir={x:0,y: 1};
    }
    t=false;
  });
})();

function start(){
  skin = skinSel.value;
  snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  dir = {x:1,y:0}; nextDir = {x:1,y:0};
  food = randFood();
  score = 0; speed = 140; paused=false;
  scoreEl.textContent = "امتیاز: " + score;
  clearInterval(loop);
  loop = setInterval(tick, speed);
  drawStatic();
}

function randFood(){
  while(true){
    const f = { x: Math.floor(Math.random()*(COLS-2))+1, y: Math.floor(Math.random()*(ROWS-2))+1 };
    if(!snake.some(s=>s.x===f.x && s.y===f.y)) return f;
  }
}

function tick(){
  if (paused) return;
  dir = nextDir;

  const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };

  // wall wrap? keep classic: collide
  if (head.x<0 || head.y<0 || head.x>=COLS || head.y>=ROWS || hitSelf(head)){
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x===food.x && head.y===food.y){
    score++;
    if (eatSound) { try{eatSound.currentTime=0; eatSound.play();}catch(_){} }
    if (score % 5 === 0 && speed>60){ // difficulty up
      clearInterval(loop); speed -= 10; loop = setInterval(tick, speed);
    }
    food = randFood();
    burstParticles(head);
  } else {
    snake.pop();
  }

  draw();
}

function hitSelf(h){ return snake.some((s,i)=> i&& s.x===h.x && s.y===h.y); }

function drawStatic(){
  // background grid
  ctx.fillStyle = "#0b0b0b";
  ctx.fillRect(0,0,cvs.width,cvs.height);
  ctx.strokeStyle = "rgba(255,255,255,.05)";
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
    ctx.strokeRect(x*GRID,y*GRID,GRID,GRID);
  }
  draw(); // draw entities
}

function draw(){
  // clear bg lightly to keep particles trails
  ctx.fillStyle = "rgba(0,0,0,0.65)";
  ctx.fillRect(0,0,cvs.width,cvs.height);

  // draw grid lines soft
  ctx.strokeStyle = "rgba(255,255,255,.04)";
  for(let x=0;x<COLS;x++) for(let y=0;y<ROWS;y++){
    ctx.strokeRect(x*GRID,y*GRID,GRID,GRID);
  }

  // draw food (pulse)
  const t = Date.now()/300;
  const pulse = (Math.sin(t)+1)/8 + .75;
  drawFood(food.x, food.y, pulse);

  // draw snake pretty
  for (let i=snake.length-1;i>=0;i--){
    const s = snake[i];
    const isHead = i===0;
    drawSegment(s.x, s.y, i, isHead);
  }

  // particles
  drawParticles();

  scoreEl.textContent = "امتیاز: " + score;
  highEl.textContent  = "رکورد: " + high;
}

function drawFood(x,y,scale){
  const cx = x*GRID + GRID/2, cy = y*GRID + GRID/2;
  const r = (GRID/2 - 3) * scale;
  const g = ctx.createRadialGradient(cx,cy,2, cx,cy,r);
  g.addColorStop(0,"#fffa");
  g.addColorStop(1,"#ff2a2a");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
  // little shine
  ctx.fillStyle = "rgba(255,255,255,.6)";
  ctx.beginPath(); ctx.arc(cx - r/3, cy - r/3, r/5, 0, Math.PI*2); ctx.fill();
}

function drawSegment(x,y,i,isHead){
  const px = x*GRID, py = y*GRID, r = 6;
  if (skin==="classic"){
    ctx.fillStyle = i===0? "#7CFC00" : "#98FB98";
    roundRect(px+1,py+1,GRID-2,GRID-2, r, true);
  } else if (skin==="glass"){
    const g = ctx.createLinearGradient(px,py,px,py+GRID);
    g.addColorStop(0,"#9be7ff"); g.addColorStop(1,"#4ac1ff");
    ctx.fillStyle = g; roundRect(px+1,py+1,GRID-2,GRID-2, r, true);
    ctx.strokeStyle="rgba(255,255,255,.35)"; ctx.strokeRect(px+2,py+2,GRID-4,GRID-4);
  } else { // neon
    ctx.shadowBlur = 12; ctx.shadowColor = "#00ff88";
    ctx.fillStyle = i===0? "#00ff88" : "#00e676";
    roundRect(px+2,py+2,GRID-4,GRID-4, r, true);
    ctx.shadowBlur = 0;
  }

  if (isHead){
    // eyes
    ctx.fillStyle="#000";
    const ex = px + GRID*0.65* (dir.x!==0? (dir.x>0?1:0.15) : 0.75);
    const ey1= py + GRID*0.35, ey2= py + GRID*0.65;
    const rx = dir.x!==0? 2:1.5, ry = dir.y!==0? 2:1.5;
    ctx.beginPath(); ctx.ellipse(ex,ey1,rx,ry,0,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(ex,ey2,rx,ry,0,0,Math.PI*2); ctx.fill();
    // tongue
    ctx.strokeStyle="#ff3b3b"; ctx.lineWidth=2;
    ctx.beginPath();
    const tx = px + GRID*(dir.x>0? .95 : dir.x<0?.05:.5);
    const ty = py + GRID*.5;
    ctx.moveTo(tx,ty);
    ctx.lineTo(tx + (dir.x*6 || 0), ty + (dir.y*6 || 0));
    ctx.stroke();
  }
}

function roundRect(x,y,w,h,r,fill){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y, x+w,y+h, r);
  ctx.arcTo(x+w,y+h, x,y+h, r);
  ctx.arcTo(x,y+h, x,y, r);
  ctx.arcTo(x,y, x+w,y, r);
  if (fill) ctx.fill();
}

function burstParticles(cell){
  for(let i=0;i<10;i++){
    particles.push({
      x: cell.x*GRID + GRID/2,
      y: cell.y*GRID + GRID/2,
      vx:(Math.random()-0.5)*4,
      vy:(Math.random()-0.5)*4,
      a:1, r:2+Math.random()*2
    });
  }
}

function drawParticles(){
  for (let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx; p.y += p.vy; p.a -= 0.03;
    if (p.a<=0){ particles.splice(i,1); continue; }
    ctx.fillStyle = "rgba(255,255,255,"+p.a.toFixed(2)+")";
    ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  }
}

function gameOver(){
  clearInterval(loop);
  if (overSound) { try{overSound.currentTime=0; overSound.play();}catch(_){} }
  if (score>high){ high=score; localStorage.setItem("snake_neo_high", String(high)); }
  document.getElementById("highscore").textContent = "رکورد: " + high;
  if (typeof sendScoreToTelegram === "function") sendScoreToTelegram(score);
  alert("💀 بازی تمام شد! امتیاز: " + score);
}
