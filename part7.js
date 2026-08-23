/* ============ 4. barras empilhadas: composicao do custo ============ */
function drawStack(top){
  const box = document.getElementById("cStack");
  const rows = top.slice(0, 12);
  const W = 900, H = 40 + rows.length*34, L = 214, R = 92, T = 26, B = 8;
  const s = svgFor(box, W, H), tip = tipFor(box);
  if(!rows.length){ el("text",{x:W/2,y:40,class:"ann","text-anchor":"middle"},s)
    .textContent = "Nenhum candidato na faixa selecionada."; return; }
  const maxT = Math.max(...rows.map(r=>r.total)) * 1.02;
  const xs = v => L + (v/maxT)*(W-L-R);
  const step = maxT > 40000 ? 10000 : 5000;
  for(let v=0; v<=maxT; v+=step){
    el("line",{x1:xs(v),x2:xs(v),y1:T-6,y2:H-B,class:"gl"},s);
    el("text",{x:xs(v),y:T-12,class:"tk","text-anchor":"middle"},s).textContent = v?BRLk(v):"0";
  }
  rows.forEach((r,i)=>{
    const y = T + i*34, h = 21;
    el("text",{x:0,y:y+11,class:"tk",fill:cssv("--ink"),"font-size":12.5,
      "font-family":'"Archivo",sans-serif'},s).textContent = (x=>x.length>28?x.slice(0,27)+"…":x)(famNome(r.fam));
    el("text",{x:0,y:y+23,class:"tk"},s).textContent = `${r.ano} · ${BRL(r.preco)}`;
    let acc = 0;
    COMPS.forEach(c=>{
      const w = (r[c.k]/maxT)*(W-L-R);
      if(w <= 0) return;
      const rect = el("rect",{x:xs(acc)+ (acc?1:0), y, width:Math.max(1,w-2), height:h,
        fill:cssv(c.v), rx:2},s);
      rect.addEventListener("pointerenter",ev=>{
        tip.innerHTML = `<div class="t">${famNome(r.fam)} ${r.ano}</div><div class="r"><span><i class="sw" style="background:${cssv(c.v)}"></i>${c.n}</span><b>${BRL(r[c.k])}/ano</b></div><div class="r"><span>Total</span><b>${BRL(r.total)}/ano</b></div>`;
        tip.classList.add("on");
        const bb = box.getBoundingClientRect();
        tip.style.left = ((xs(acc)+w/2)/W*100)+"%"; tip.style.top = (y/H*bb.height)+"px";
      });
      rect.addEventListener("pointerleave",()=>tip.classList.remove("on"));
      acc += r[c.k];
    });
    el("text",{x:xs(r.total)+9, y:y+15, class:"tk", fill:cssv("--ink"), "font-weight":600},s)
      .textContent = BRL(r.total);
  });
  document.getElementById("lgStack").innerHTML = COMPS.map(c=>
    `<span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv(c.v)}"></i>${c.n}</span>`).join("");
}

/* ============ 5. fronteira: preço de compra x custo anual ============ */
function drawScatter(cs, top){
  const box = document.getElementById("cScat");
  const W = 900, H = 440, L = 70, R = 28, T = 22, B = 50;
  const s = svgFor(box, W, H), tip = tipFor(box);
  if(!cs.length){ el("text",{x:W/2,y:H/2,class:"ann","text-anchor":"middle"},s)
    .textContent = "Nenhum candidato na faixa."; return; }
  const px = cs.map(c=>c.preco), py = cs.map(c=>c.total);
  const x0 = Math.min(...px)*.96, x1 = Math.max(...px)*1.04;
  const y0 = Math.min(...py)*.92, y1 = Math.max(...py)*1.05;
  const xs = v => L + (v-x0)/(x1-x0)*(W-L-R);
  const ys = v => T + (1-(v-y0)/(y1-y0))*(H-T-B);
  const sy = (y1-y0) > 30000 ? 10000 : 5000;
  for(let v=Math.ceil(y0/sy)*sy; v<=y1; v+=sy){
    el("line",{x1:L,x2:W-R,y1:ys(v),y2:ys(v),class:"gl"},s);
    el("text",{x:L-9,y:ys(v)+3.5,class:"tk","text-anchor":"end"},s).textContent = BRLk(v);
  }
  const sx = (x1-x0) > 90000 ? 25000 : 10000;
  for(let v=Math.ceil(x0/sx)*sx; v<=x1; v+=sx){
    el("line",{x1:xs(v),x2:xs(v),y1:T,y2:H-B,class:"gl"},s);
    el("text",{x:xs(v),y:H-B+18,class:"tk","text-anchor":"middle"},s).textContent = BRLk(v);
  }
  el("line",{x1:L,x2:W-R,y1:H-B,y2:H-B,class:"ax"},s);
  el("text",{x:L,y:H-6,class:"axlab"},s).textContent = "Preço de compra (FIPE)";
  el("text",{x:L-56,y:T-4,class:"axlab"},s).textContent = "Custo R$ / ano";

  const Q = ["--q2","--q3","--q4","--q5","--q6","--q7","--q8"];
  const topSet = new Set(top.slice(0,3).map(c=>c.fam+c.ano));
  cs.forEach(c=>{
    const isTop = topSet.has(c.fam+c.ano);
    const qi = Math.max(0, Math.min(6, Math.round(c.idade/10*6)));
    const g = el("circle",{cx:xs(c.preco), cy:ys(c.total), r:isTop?7:4.5,
      fill:cssv(Q[qi]), stroke:cssv("--card"), "stroke-width":2, opacity:isTop?1:.82},s);
    if(isTop) el("circle",{cx:xs(c.preco),cy:ys(c.total),r:11,fill:"none",
      stroke:cssv("--ink"),"stroke-width":1.5},s);
    g.style.cursor="pointer";
    g.addEventListener("pointerenter",()=>{
      tip.innerHTML = `<div class="t">${famNome(c.fam)} ${c.ano}</div>
        <div class="r"><span>Preço</span><b>${BRL(c.preco)}</b></div>
        <div class="r"><span>Custo/ano</span><b>${BRL(c.total)}</b></div>
        <div class="r"><span>Idade</span><b>${c.idade} anos</b></div>
        <div class="r"><span>Garantia</span><b>${c.garMeses?c.garMeses+" meses":"vencida"}</b></div>`;
      tip.classList.add("on");
      const bb = box.getBoundingClientRect();
      tip.style.left = (xs(c.preco)/W*100)+"%"; tip.style.top = (ys(c.total)/H*bb.height - 12)+"px";
    });
    g.addEventListener("pointerleave",()=>tip.classList.remove("on"));
    g.addEventListener("click",()=>{ S.sel={fam:c.fam,ano:c.ano};
      S.curvas.forEach(x=>{ if(x.nome===c.fam) x.on=true; }); render(); });
  });
  // rotulos do top 3 com fuga de colisao
  const marc = top.slice(0,3).map(c=>({c, x:xs(c.preco), y:ys(c.total)}));
  marc.sort((a,b)=>a.y-b.y);
  for(let i=1;i<marc.length;i++){
    const d = marc[i].y - marc[i-1].y;
    if(Math.abs(marc[i].x - marc[i-1].x) < 190 && d < 16) marc[i].y = marc[i-1].y + 16;
  }
  marc.forEach(m=>{
    const right = m.x < W-250;
    const lx = m.x + (right?16:-16);
    el("line",{x1:m.x + (right?7:-7), y1:ys(m.c.total), x2:lx-3, y2:m.y-3,
      stroke:cssv("--ink-3"), "stroke-width":1, opacity:.55},s);
    el("text",{x:lx, y:m.y, class:"dlab", "text-anchor":right?"start":"end", fill:cssv("--ink")},s)
      .textContent = `${famNome(m.c.fam)} ${m.c.ano}`;
  });
  document.getElementById("lgScat").innerHTML =
    `<span style="color:var(--ink-3)">Idade:</span><span style="display:inline-flex;gap:0;align-items:center">
     <span style="color:var(--ink-3);margin-right:7px">0 anos</span>
     ${Q.map(q=>`<i class="sw" style="background:var(${q});border-radius:0;width:20px"></i>`).join("")}
     <span style="color:var(--ink-3);margin-left:7px">10 anos</span></span>
     <span style="color:var(--ink-3);margin-left:14px">Círculo com anel = top 3 do ranking. Quanto mais baixo no gráfico, mais barato de manter por ano.</span>`;
}
