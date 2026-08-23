/* ============ 2. curva em U: custo por ano vs idade na compra ============ */
const COMPS = [
  {k:"deprec", n:"Depreciação", v:"--s1"}, {k:"manut", n:"Manutenção", v:"--s2"},
  {k:"seguro", n:"Seguro",      v:"--s3"}, {k:"ipva",  n:"IPVA",       v:"--s4"},
  {k:"comb",   n:"Combustível", v:"--s5"}, {k:"juros", n:"Juros", v:"--s6"}
];
function drawU(){
  const box = document.getElementById("cU");
  const ativa = S.curvas && S.curvas.find(c=>c.on);
  const alvo = S.sel ? S.sel.fam : (ativa ? ativa.nome : null);
  const f = (alvo && D.familias.find(x => x.nome === alvo)) || D.familias[0];
  if(!f){ svgFor(box, 900, 120); return; }
  document.getElementById("uFam").textContent = famNome(f.nome);
  const rows = Object.keys(f.serie).map(Number).filter(a => a <= D.anoRef)
    .sort((a,b)=>a-b).map(a => tco(f, a)).filter(Boolean);
  const dim = dimChart(box, {minH: 330, maxH: 540});
  const W = dim.W, H = dim.H;
  const L = dim.estreito ? 54 : 68, R = dim.estreito ? 14 : 26;
  const T = 20, B = dim.estreito ? 54 : 50;
  const s = svgFor(box, W, H), tip = tipFor(box);
  if (rows.length < 2){ el("text",{x:W/2,y:H/2,class:"ann","text-anchor":"middle"},s)
    .textContent = "Dados insuficientes para esta família."; return; }
  const idades = rows.map(r=>r.idade), maxI = Math.max(...idades), minI = Math.min(...idades);
  const maxT = Math.max(...rows.map(r=>r.total)) * 1.08;
  const xs = i => L + ((i-minI)/(maxI-minI||1)) * (W-L-R);
  const ys = v => T + (1 - v/maxT) * (H-T-B);
  const step = maxT > 40000 ? 10000 : 5000;
  for(let v=0; v<=maxT; v+=step){
    el("line",{x1:L,x2:W-R,y1:ys(v),y2:ys(v),class:"gl"},s);
    el("text",{x:L-9,y:ys(v)+3.5,class:"tk","text-anchor":"end"},s).textContent = v?BRLk(v):"0";
  }
  el("line",{x1:L,x2:W-R,y1:ys(0),y2:ys(0),class:"ax"},s);
  rows.forEach(r=>el("text",{x:xs(r.idade),y:H-B+18,class:"tk","text-anchor":"middle"},s)
    .textContent = r.ano);
  el("text",{x:L,y:H-6,class:"axlab"},s).textContent = "Ano modelo comprado hoje";
  el("text",{x:L-56,y:T-4,class:"axlab"},s).textContent = "R$ / ano";

  // areas empilhadas (2px de respiro entre camadas)
  let acc = rows.map(()=>0);
  COMPS.forEach(c=>{
    const lo = rows.map((r,i)=>[xs(r.idade), ys(acc[i])]);
    acc = acc.map((v,i)=>v + rows[i][c.k]);
    const hi = rows.map((r,i)=>[xs(r.idade), ys(acc[i])]);
    el("path",{d: path(hi)+" "+path(lo.slice().reverse()).replace(/^M/,"L")+" Z",
      fill: cssv(c.v), opacity:.88, stroke:cssv("--card"), "stroke-width":2, "stroke-linejoin":"round"},s);
  });
  // linha do total + ponto minimo
  el("path",{d:path(rows.map(r=>[xs(r.idade),ys(r.total)])), fill:"none",
    stroke:cssv("--ink"), "stroke-width":2, "stroke-linejoin":"round"},s);
  const best = rows.reduce((a,b)=>b.total<a.total?b:a);
  el("circle",{cx:xs(best.idade),cy:ys(best.total),r:6,fill:"none",stroke:cssv("--ink"),"stroke-width":2},s);
  el("circle",{cx:xs(best.idade),cy:ys(best.total),r:3,fill:cssv("--ink")},s);
  const lx = xs(best.idade) > W-220 ? xs(best.idade)-14 : xs(best.idade)+14;
  const an = xs(best.idade) > W-220 ? "end" : "start";
  el("text",{x:lx,y:ys(best.total)-16,class:"annb","text-anchor":an},s)
    .textContent = `menor custo: ${best.ano}`;
  el("text",{x:lx,y:ys(best.total)-2,class:"ann","text-anchor":an},s)
    .textContent = `${BRL(best.total)}/ano · ${BRL(best.preco)} de entrada`;

  rows.forEach(r=>{
    const hz = el("rect",{x:xs(r.idade)-16,y:T,width:32,height:H-T-B,fill:"transparent"},s);
    hz.addEventListener("pointerenter",()=>{
      let h = `<div class="t">${famNome(f.nome)} ${r.ano}</div>`;
      h += `<div class="r"><span>Preço FIPE</span><b>${BRL(r.preco)}</b></div>`;
      COMPS.forEach(c=>{ h += `<div class="r"><span><i class="sw" style="background:${cssv(c.v)}"></i>${c.n}</span><b>${BRL(r[c.k])}</b></div>`; });
      h += `<div class="r" style="border-top:1px solid var(--rule-2);margin-top:5px;padding-top:5px"><span><b>Total</b></span><b>${BRL(r.total)}/ano</b></div>`;
      tip.innerHTML = h; tip.classList.add("on");
      tip.style.left = (xs(r.idade)/W*100)+"%";
      tip.style.top  = (ys(r.total)/H*box.getBoundingClientRect().height - 10)+"px";
    });
    hz.addEventListener("pointerleave",()=>tip.classList.remove("on"));
  });
  const lg = document.getElementById("lgU");
  lg.innerHTML = COMPS.map(c=>`<span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv(c.v)}"></i>${c.n}</span>`).join("")
    + `<span style="display:inline-flex;gap:7px;align-items:center;color:var(--ink-2)"><i class="sw" style="background:${cssv("--ink")};height:2px;border-radius:0"></i>Total</span>`;
}

/* ============ 3. matriz preço x ano ============ */
function drawHeat(top){
  const host = document.getElementById("heat");
  const anos = []; for(let a=2016; a<=D.anoRef; a++) anos.push(a);
  const alvoB = norm(S.busca);
  let fams = D.familias.filter(f =>
    (!alvoB || norm(f.nome).includes(alvoB) || norm(f.marca).includes(alvoB)) &&
    (S.seg === "todos" || f.segmento === S.seg) && (S.marca === "todas" || f.marca === S.marca) &&
    (S.ene === "todas" || f.energia === S.ene));
  const all = candidatos(true);
  const byFam = {}; all.forEach(c => (byFam[c.fam] = byFam[c.fam] || []).push(c));
  const buscando = !!norm(S.busca);
  const dentro = c => buscando || (c.preco>=S.budMin && c.preco<=S.budMax);
  // ordem = melhor score do ranking, a mesma logica dos cards, e nao custo bruto
  const melhorScore = {};
  (top||[]).forEach(c => { if(melhorScore[c.fam] === undefined) melhorScore[c.fam] = c.score; });
  fams = fams.filter(f => (byFam[f.nome]||[]).some(dentro))
             .sort((a,b)=>(melhorScore[b.nome] ?? -1) - (melhorScore[a.nome] ?? -1));
  const TOTAL_FAMS = fams.length;
  const LIM = window.innerWidth < 700 ? (S.verMaisHeat ? 40 : 10) : 40;
  fams = fams.slice(0, LIM);
  const Q = ["--q1","--q2","--q3","--q4","--q5","--q6","--q7","--q8"];
  const lo = S.budMin, hi = S.budMax;
  if(window.innerWidth < 700){                       // celular: lista por modelo, sem rolar de lado
    const Qm = ["--q1","--q2","--q3","--q4","--q5","--q6","--q7","--q8"];
    let lista = `<div class="hmlista">`;
    fams.forEach(f=>{
      const its = (byFam[f.nome]||[]).filter(c=>c.ano>=2016).sort((a,b)=>b.ano-a.ano);
      if(!its.length) return;
      lista += `<div class="hmitem"><h4>${famNome(f.nome)}<span>${segNome(f.segmento)} · ${f.cambio}</span></h4><div class="anos">`;
      its.forEach(c=>{
        const t = Math.max(0, Math.min(1, (c.preco-lo)/((hi-lo)||1)));
        const qi = Math.max(0, Math.min(7, Math.round(t*7)));
        const fora = !buscando && (c.preco < lo || c.preco > hi);
        lista += `<button class="hmano${fora?" out":""}" data-f="${f.nome}" data-a="${c.ano}"
          style="background:var(${Qm[qi]});color:${inkPara(Qm[qi])}">
          <b>${c.ano}</b><span>${BRLk(c.preco)}</span><span class="est">${BRLk(c.total)}/ano</span></button>`;
      });
      lista += `</div></div>`;
    });
    lista += `</div>`;
    host.innerHTML = fams.length ? lista
      : `<p style="padding:16px;color:var(--ink-2)">Nenhum modelo cai nessa faixa. Amplie o orçamento.</p>`;
    if(TOTAL_FAMS > LIM && !S.verMaisHeat){
      const mais = document.createElement("button");
      mais.className = "tbtn"; mais.style.cssText = "width:100%;margin-top:16px";
      mais.textContent = `Ver os outros ${TOTAL_FAMS - LIM} modelos`;
      mais.onclick = () => { S.verMaisHeat = true; render(); };
      host.appendChild(mais);
    }
    host.querySelectorAll(".hmano").forEach(b=>b.onclick = ()=>{
      S.sel = {fam:b.dataset.f, ano:+b.dataset.a};
      S.curvas.forEach(c=>{ if(c.nome===b.dataset.f) c.on = true; });
      render();
      document.getElementById("s-detalhe").scrollIntoView({behavior:"smooth", block:"start"});
    });
    const aviso0 = TOTAL_FAMS > LIM
      ? `Mostrando os ${LIM} primeiros do ranking, de ${TOTAL_FAMS} modelos no filtro.` : "";
    document.getElementById("hmScale").innerHTML =
      `<span>${BRL(lo)}</span><span class="bar">${Qm.map(q=>`<i style="background:var(${q})"></i>`).join("")}</span><span>${BRL(hi)}</span><span>Em cima o preço FIPE, embaixo o custo por ano. ${aviso0}</span>`;
    return;
  }
  let html = `<table class="hm"><thead><tr><th class="rowh">Modelo (versões automáticas)</th>`;
  anos.forEach(a=>html += `<th>${a}<span style="display:block;font-weight:400;opacity:.7">${D.anoRef-a}a</span></th>`);
  html += `</tr></thead><tbody>`;
  fams.forEach(f=>{
    html += `<tr><th class="rowh">${famNome(f.nome)}<span style="display:block;font-weight:400;font-size:10.5px;color:var(--ink-3)">${segNome(f.segmento)} · ${f.cambio}</span></th>`;
    anos.forEach(a=>{
      const c = (byFam[f.nome]||[]).find(x=>x.ano===a);
      if(!c){ html += `<td><span class="none">–</span></td>`; return; }
      const t = Math.max(0, Math.min(1, (c.preco-lo)/((hi-lo)||1)));
      const qi = Math.max(0, Math.min(7, Math.round(t*7)));
      const out = !buscando && (c.preco < lo || c.preco > hi);
      const ink = inkPara(Q[qi]);
      html += `<td><button class="cell${out?" out":""}" data-f="${f.nome}" data-a="${a}"
        style="background:var(${Q[qi]});color:${ink}"
        title="${famNome(f.nome)} ${a} · preço FIPE ${BRL(c.preco)} · custo estimado ${BRL(c.total)}/ano">${BRLk(c.preco)}<span class="ag est">${BRLk(c.total)}/ano</span></button></td>`;
    });
    html += `</tr>`;
  });
  html += `</tbody></table>`;
  host.innerHTML = fams.length ? html
    : `<p class="sdesc" style="padding:20px">Nenhum modelo cai nessa faixa de preço. Amplie o orçamento no topo.</p>`;
  const cels = [...host.querySelectorAll(".cell")];
  cels.forEach((b,i)=>b.tabIndex = i === 0 ? 0 : -1);
  const tab = host.querySelector("table.hm");
  if(tab) tab.onkeydown = ev=>{
    const i = cels.indexOf(document.activeElement);
    if(i < 0) return;
    const linha = document.activeElement.closest("tr");
    const porLinha = [...linha.querySelectorAll(".cell")];
    const col = porLinha.indexOf(document.activeElement);
    let alvo = null;
    if(ev.key === "ArrowRight") alvo = cels[i+1];
    else if(ev.key === "ArrowLeft") alvo = cels[i-1];
    else if(ev.key === "ArrowDown" || ev.key === "ArrowUp"){
      const linhas = [...tab.querySelectorAll("tbody tr")];
      const li = linhas.indexOf(linha) + (ev.key === "ArrowDown" ? 1 : -1);
      const prox = linhas[li];
      if(prox){ const c2 = [...prox.querySelectorAll(".cell")]; alvo = c2[Math.min(col, c2.length-1)]; }
    } else if(ev.key === "Home") alvo = porLinha[0];
    else if(ev.key === "End") alvo = porLinha[porLinha.length-1];
    if(alvo){ ev.preventDefault();
      cels.forEach(c=>c.tabIndex=-1); alvo.tabIndex = 0; alvo.focus(); }
  };
  host.querySelectorAll(".cell").forEach(b=>b.onclick = ()=>{
    S.sel = {fam:b.dataset.f, ano:+b.dataset.a};
    if(!S.curvas.find(c=>c.nome===b.dataset.f && c.on)){
      S.curvas.forEach(c=>{ if(c.nome===b.dataset.f) c.on = true; });
    }
    render();
    document.getElementById("secU").scrollIntoView({behavior:"smooth", block:"start"});
  });
  const aviso = TOTAL_FAMS > LIM
    ? `<span style="margin-left:10px">Mostrando os ${LIM} primeiros do ranking, de ${TOTAL_FAMS} modelos que cabem no filtro. Use a busca ou estreite marca e segmento para ver os outros.</span>` : "";
  document.getElementById("hmScale").innerHTML =
    `<span>${BRL(lo)}</span><span class="bar">${Q.map(q=>`<i style="background:var(${q})"></i>`).join("")}</span><span>${BRL(hi)}</span>
     <span style="margin-left:10px">Valor em cima = preço FIPE. Embaixo = custo estimado por ano de posse.</span>${aviso}`;
}
