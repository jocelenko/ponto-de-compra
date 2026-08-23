/* ============ 3. amplitude do custo por idade: modelo pesa mais que ano ============ */
function drawRange(cs){
  const box = document.getElementById("cRange");
  const W = 900, H = 400, L = 66, R = 152, T = 22, B = 50;
  const s = svgFor(box, W, H), tip = tipFor(box);
  const byI = {};
  cs.forEach(c => (byI[c.idade] = byI[c.idade] || []).push(c));
  const idades = Object.keys(byI).map(Number).sort((a,b)=>a-b);
  if (idades.length < 2){ el("text",{x:W/2,y:H/2,class:"ann","text-anchor":"middle"},s)
    .textContent = "Amplie o orçamento para comparar idades."; return; }
  const q = (arr,p) => { const v = arr.slice().sort((a,b)=>a-b);
    return v[Math.min(v.length-1, Math.floor(p*(v.length-1)))]; };
  const stats = idades.map(i=>{ const t = byI[i].map(c=>c.total);
    const lo = Math.min(...t), hi = Math.max(...t);
    return { i, lo, hi, q1:q(t,.25), q3:q(t,.75), med:q(t,.5), n:t.length,
             best: byI[i].reduce((a,b)=>b.total<a.total?b:a),
             worst: byI[i].reduce((a,b)=>b.total>a.total?b:a) }; });
  const lo0 = Math.min(...stats.map(d=>d.lo))*.97, hi0 = Math.max(...stats.map(d=>d.hi))*1.03;
  const xs = i => L + ((i-idades[0])/((idades[idades.length-1]-idades[0])||1))*(W-L-R);
  const ys = v => T + (1-(v-lo0)/(hi0-lo0))*(H-T-B);
  const step = (hi0-lo0) > 16000 ? 5000 : 2000;
  for(let v=Math.ceil(lo0/step)*step; v<=hi0; v+=step){
    el("line",{x1:L,x2:W-R,y1:ys(v),y2:ys(v),class:"gl"},s);
    el("text",{x:L-9,y:ys(v)+3.5,class:"tk","text-anchor":"end"},s).textContent = BRLk(v);
  }
  el("line",{x1:L,x2:W-R,y1:H-B,y2:H-B,class:"ax"},s);
  idades.forEach(i=>el("text",{x:xs(i),y:H-B+18,class:"tk","text-anchor":"middle"},s).textContent = i);
  el("text",{x:L,y:H-6,class:"axlab"},s).textContent = "Idade do carro na compra (anos)";
  el("text",{x:L-52,y:T-4,class:"axlab"},s).textContent = "Custo R$ / ano";

  stats.forEach(d=>{
    const x = xs(d.i);
    el("line",{x1:x,x2:x,y1:ys(d.lo),y2:ys(d.hi),stroke:cssv("--axis"),"stroke-width":1.5,"stroke-linecap":"round"},s);
    el("rect",{x:x-9,y:ys(d.q3),width:18,height:Math.max(2,ys(d.q1)-ys(d.q3)),
      fill:cssv("--s1"),opacity:.24,rx:3},s);
    el("line",{x1:x-11,x2:x+11,y1:ys(d.med),y2:ys(d.med),stroke:cssv("--s1"),"stroke-width":3,"stroke-linecap":"round"},s);
    const hz = el("rect",{x:x-14,y:T,width:28,height:H-T-B,fill:"transparent"},s);
    hz.style.cursor="pointer";
    hz.addEventListener("pointerenter",()=>{
      tip.innerHTML = `<div class="t">${d.i} ano${d.i===1?"":"s"} de idade · ${d.n} modelos</div>
        <div class="r"><span>Mais barato</span><b>${BRL(d.lo)}</b></div>
        <div class="r" style="color:var(--ink-3);font-size:11.5px"><span>${famNome(d.best.fam)} ${d.best.ano}</span></div>
        <div class="r"><span>Mediana</span><b>${BRL(d.med)}</b></div>
        <div class="r"><span>Mais caro</span><b>${BRL(d.hi)}</b></div>
        <div class="r" style="color:var(--ink-3);font-size:11.5px"><span>${famNome(d.worst.fam)} ${d.worst.ano}</span></div>
        <div class="r" style="border-top:1px solid var(--rule-2);margin-top:5px;padding-top:5px"><span>Amplitude</span><b>${PCT(100*(d.hi/d.lo-1))}</b></div>`;
      tip.classList.add("on");
      tip.style.left = (x/W*100)+"%"; tip.style.top = (ys(d.hi)/H*box.getBoundingClientRect().height - 10)+"px";
    });
    hz.addEventListener("pointerleave",()=>tip.classList.remove("on"));
  });
  // linha da mediana
  el("path",{d:path(stats.map(d=>[xs(d.i),ys(d.med)])),fill:"none",stroke:cssv("--s1"),
    "stroke-width":2,"stroke-dasharray":"4 4",opacity:.65},s);

  const meds = stats.map(d=>d.med);
  const varIdade = 100*(Math.max(...meds)/Math.min(...meds)-1);
  const varModelo = stats.reduce((a,d)=>a+100*(d.hi/d.lo-1),0)/stats.length;
  const xe = xs(idades[idades.length-1]);
  el("text",{x:xe+18,y:ys(meds[meds.length-1])-4,class:"dlab",fill:cssv("--s1")},s).textContent = "mediana";
  el("text",{x:xe+18,y:ys(meds[meds.length-1])+12,class:"ann"},s).textContent = `varia só ${varIdade.toFixed(0)}%`;
  const dh = stats[stats.length-1];
  el("text",{x:xe+18,y:ys(dh.hi)+4,class:"dlab",fill:cssv("--ink-2")},s).textContent = "mais caro";
  el("text",{x:xe+18,y:ys(dh.lo)+4,class:"dlab",fill:cssv("--ink-2")},s).textContent = "mais barato";
  el("text",{x:xe+18,y:ys(dh.lo)+18,class:"ann"},s).textContent = `distância média ${varModelo.toFixed(0)}%`;

  document.getElementById("varIdade").textContent = varIdade.toFixed(0)+"%";
  document.getElementById("varModelo").textContent = varModelo.toFixed(0)+"%";
  document.getElementById("lgRange").innerHTML =
    `<span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv("--s1")};opacity:.24"></i>Metade central dos modelos</span>
     <span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv("--s1")};height:3px;border-radius:0"></i>Mediana</span>
     <span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv("--axis")};width:2px;height:14px;border-radius:0"></i>Do mais barato ao mais caro</span>`;
}
