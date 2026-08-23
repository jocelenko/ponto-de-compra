/* ============ helpers svg ============ */
const NS = "http://www.w3.org/2000/svg";
function el(t, a, p){ const e = document.createElementNS(NS,t);
  for(const k in (a||{})) e.setAttribute(k, a[k]); if(p) p.appendChild(e); return e; }
function svgFor(box, w, h){
  box.innerHTML = "";
  const s = el("svg", {viewBox:`0 0 ${w} ${h}`, role:"img", preserveAspectRatio:"xMidYMid meet"}, box);
  return s;
}
function tipFor(box){
  let t = box.querySelector(".tip");
  if(!t){ t = document.createElement("div"); t.className = "tip"; box.appendChild(t); }
  return t;
}
const path = pts => pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");

/* ============ 1. curva de retencao ============ */
function drawCurva(){
  const box = document.getElementById("cCurva");
  const W = 900, H = 430, L = 58, R = 140, T = 20, B = 46;
  const s = svgFor(box, W, H), tip = tipFor(box);
  const xs = i => L + (i/12) * (W-L-R);
  const ys = v => T + (1 - (v-0.15)/(1.0-0.15)) * (H-T-B);

  for(let v=0.2; v<=1.001; v+=0.1){
    el("line",{x1:L,x2:W-R,y1:ys(v),y2:ys(v),class:"gl"},s);
    el("text",{x:L-9,y:ys(v)+3.5,class:"tk","text-anchor":"end"},s).textContent = Math.round(v*100)+"%";
  }
  el("line",{x1:L,x2:W-R,y1:ys(0.15),y2:ys(0.15),class:"ax"},s);
  for(let i=0;i<=12;i+=2){
    el("text",{x:xs(i),y:H-B+18,class:"tk","text-anchor":"middle"},s).textContent = i;
  }
  el("text",{x:L,y:H-4,class:"axlab"},s).textContent = "Idade do carro (anos)";
  el("text",{x:L-42,y:T-4,class:"axlab"},s).textContent = "% do valor de 0 km";

  // mediana de mercado
  const med = [];
  for(let i=0;i<=12;i++){
    const v = D.familias.filter(f=>idadeMin(f) <= i).map(f=>relIdade(f,i)).sort((a,b)=>a-b);
    med.push(v.length ? v[Math.floor(v.length/2)] : med[i-1]);
  }
  el("path",{d:path(med.map((v,i)=>[xs(i),ys(v)])), fill:"none", stroke:cssv("--ink-3"),
    "stroke-width":2.5, "stroke-dasharray":"5 4", "stroke-linecap":"round"},s);

  // meia-vida: idade em que a mediana cruza 50% do valor de 0 km
  let meia = 12;
  for(let i=1;i<=12;i++){ if(med[i] <= 0.5){ meia = i; break; } }
  const quedas = []; for(let i=0;i<12;i++) quedas.push(1 - med[i+1]/med[i]);
  const qMed = quedas.slice().sort((a,b)=>a-b)[Math.floor(quedas.length/2)];
  const jx = xs(meia);
  el("line",{x1:jx,x2:jx,y1:T,y2:H-B,stroke:cssv("--marker"),"stroke-width":1.5,"stroke-dasharray":"3 3"},s);
  const anc = jx > W-R-230 ? "end" : "start", dx = jx > W-R-230 ? -8 : 6;
  el("text",{x:jx+dx,y:T+13,class:"annb",fill:cssv("--marker"),"text-anchor":anc},s).textContent = "metade do valor";
  el("text",{x:jx+dx,y:T+28,class:"ann","text-anchor":anc},s).textContent = `${meia} anos`;
  const elQ = document.getElementById("quedaAno"); if(elQ) elQ.textContent = (qMed*100).toFixed(1).replace(".",",") + "%";
  const elM = document.getElementById("meiaVida"); if(elM) elM.textContent = meia;

  // famílias selecionadas
  const act = S.curvas.filter(n=>n.on).slice(0,6);
  const rot = [];   // rotulos diretos, posicionados sem colisao
  act.forEach((n,k)=>{
    const f = D.familias.find(x=>x.nome===n.nome); if(!f) return;
    const col = cssv(SERIES[k % 6]); n.col = col;
    const i0 = Math.min(12, idadeMin(f));
    const pts = []; for(let i=i0;i<=12;i++) pts.push([xs(i), ys(relIdade(f,i))]);
    if(!pts.length) return;
    el("path",{d:path(pts), fill:"none", stroke:col, "stroke-width":2,
      "stroke-linejoin":"round","stroke-linecap":"round"},s);
    const fim = pts[pts.length-1];
    el("circle",{cx:fim[0], cy:fim[1], r:3.5, fill:col, stroke:cssv("--card"),"stroke-width":2},s);
    rot.push({y: ys(relIdade(f,12)), col,
      txt: famNome(f.nome).replace(/^(Chevrolet|Hyundai|Toyota|Honda|Renault|Nissan|Jeep|Fiat|VW|Caoa Chery|BYD|GWM) /,"")});
  });

  // rotulos diretos com separacao minima
  rot.push({y: ys(med[12]), col: cssv("--ink-3"), txt: "Mediana", med: true});
  rot.sort((a,b)=>a.y-b.y);
  const GAP = 13;
  for(let i=1;i<rot.length;i++) if(rot[i].y - rot[i-1].y < GAP) rot[i].y = rot[i-1].y + GAP;
  const excesso = rot.length ? rot[rot.length-1].y - (H-B) : 0;
  if(excesso > 0) rot.forEach(r => r.y -= excesso);
  rot.forEach(r=>{
    el("text",{x:xs(12)+10, y:r.y+4, class:"dlab", fill:r.col},s).textContent = r.txt;
  });

  // crosshair
  const cross = el("line",{y1:T,y2:H-B,stroke:cssv("--ink-3"),"stroke-width":1,opacity:0},s);
  const hit = el("rect",{x:L,y:T,width:W-L-R,height:H-T-B,fill:"transparent"},s);
  hit.style.cursor = "crosshair";
  hit.addEventListener("pointermove", ev=>{
    const r = s.getBoundingClientRect(), sc = W/r.width;
    const px = (ev.clientX - r.left)*sc;
    const i = Math.max(0, Math.min(12, Math.round((px-L)/((W-L-R)/12))));
    cross.setAttribute("x1", xs(i)); cross.setAttribute("x2", xs(i)); cross.setAttribute("opacity", .5);
    let html = `<div class="t">${i} ano${i===1?"":"s"} de uso</div>`;
    html += `<div class="r"><span>Mediana</span><b>${PCT(med[i]*100)}</b></div>`;
    act.forEach(n=>{ const f=D.familias.find(x=>x.nome===n.nome); if(!f) return;
      html += `<div class="r"><span><i class="sw" style="background:${n.col}"></i>${famNome(n.nome)}</span><b>${PCT(relIdade(f,i)*100)}</b></div>`; });
    tip.innerHTML = html; tip.classList.add("on");
    tip.style.left = (xs(i)/W*100) + "%";
    tip.style.top = (ys(med[i])/H*r.height - 12) + "px";
  });
  hit.addEventListener("pointerleave", ()=>{ cross.setAttribute("opacity",0); tip.classList.remove("on"); });

  // legenda
  const lg = document.getElementById("lgCurva");
  lg.innerHTML = "";
  const disp = S.curvas.filter(n => n.on || (S.elegiveis && S.elegiveis.has(n.nome))).slice(0, 26);
  disp.forEach((n,i)=>{
    const b = document.createElement("button");
    b.setAttribute("aria-pressed", n.on);
    const k = act.indexOf(n);
    b.innerHTML = `<i class="sw" style="background:${n.on&&k>=0?cssv(SERIES[k%6]):cssv("--ink-3")}"></i>${famNome(n.nome)}`;
    b.onclick = ()=>{ n.on = !n.on; drawCurva(); };
    lg.appendChild(b);
  });

}
