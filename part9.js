/* ============ orquestração ============ */
function render(){
  const cs = pontuar(candidatos(false));
  if(S.listaN > 10 && S._ultimoN !== cs.length){ S.listaN = 10; }   // filtro mudou: recomeca a lista
  S._ultimoN = cs.length;
  const top = cs.slice().sort((a,b)=>b.score-a.score);
  if(!S.curvas){
    const seed = [];
    for(const c of top){ if(!seed.includes(c.fam)) seed.push(c.fam); if(seed.length>=4) break; }
    S.curvas = D.familias.map(f=>({nome:f.nome, on:seed.includes(f.nome)}));
  }
  if(!S.curvas.some(c=>c.on) && top.length){
    const alvo = S.curvas.find(c=>c.nome===top[0].fam); if(alvo) alvo.on = true;
  }
  S.elegiveis = new Set(); for(const c of top){ S.elegiveis.add(c.fam); if(S.elegiveis.size>=22) break; }
  if(S.busca && top.length){
    if(!S.sel || !top.some(c=>c.fam===S.sel.fam)) S.sel = {fam: top[0].fam, ano: top[0].ano};
    const vistas = new Set(top.slice(0,60).map(c=>c.fam));
    S.curvas.forEach(c => c.on = vistas.has(c.nome));
    let n=0; S.curvas.forEach(c => { if(c.on){ n++; if(n>6) c.on=false; } });
  }
  if(S.sel && !cs.some(c=>c.fam===S.sel.fam && c.ano===S.sel.ano)) S.sel = null;

  drawTopo(top, cs); drawPicks(top, cs); drawTiles(cs, top); drawCriterios();
  drawCurva(); drawRange(cs); drawU();
  drawHeat(top); drawStack(top); drawScatter(cs, top); drawTable(cs);

  const q = id => document.getElementById(id);
  q("cCount").textContent = cs.length;
  q("tblCount").textContent = cs.length;
  q("pesoN").textContent = cs.length;
  q("contRes").textContent = cs.length;
  const n = filtrosAtivos();
  q("contFiltros").textContent = n;
  q("contFiltros").style.display = n ? "" : "none";
  revelar();
}

/* ============ controles ============ */
const FAIXAS = [10000,15000,20000,30000,40000,50000,60000,80000,100000,120000,150000,200000,250000,300000,400000,500000];
function bind(){
  const q = id => document.getElementById(id);
  const opt = (v,t) => `<option value="${v}">${t}</option>`;

  q("budMin").innerHTML = FAIXAS.slice(0,-1).map(v=>opt(v,`de R$ ${(v/1000).toLocaleString("pt-BR")} mil`)).join("");
  q("budMax").innerHTML = FAIXAS.slice(1).map(v=>opt(v,`até R$ ${(v/1000).toLocaleString("pt-BR")} mil`)).join("");
  q("budMin").value = S.budMin; q("budMax").value = S.budMax;
  q("idadeMin").innerHTML = [0,1,2,3,4,5,6,8,10,12].map(v=>opt(v, v===0?"de 0 km":`de ${v} ano${v>1?"s":""}`)).join("");
  q("idadeMax").innerHTML = [2,3,4,5,6,8,10,12,14,16].map(v=>opt(v, v>=16?"sem limite de idade":`até ${v} anos`)).join("");
  q("idadeMin").value = S.idadeMin; q("idadeMax").value = S.idadeMax;
  q("buscaSel").innerHTML = `<option value="">Todos os modelos</option>` +
    [...new Set(D.familias.map(f=>famNome(f.nome)))].sort((a,b)=>a.localeCompare(b,"pt-BR"))
      .map(n=>opt(n,n)).join("");
  const segs = [...new Set(D.familias.map(f=>f.segmento))].sort();
  q("seg").innerHTML = opt("todos","Todos os segmentos") + segs.map(s=>opt(s,segNome(s))).join("");
  const mks = [...new Set(D.familias.map(f=>f.marca))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  q("marca").innerHTML = opt("todas","Todas as marcas") + mks.map(s=>opt(s,s)).join("");
  q("ene").innerHTML = opt("todas","Todos os combustíveis") +
    ["flex","hibrido","eletrico","diesel"].map(e=>opt(e,ENERGIA_NOME[e])).join("");

  const upd = () => {
    q("vKm").textContent   = `${S.km.toLocaleString("pt-BR")} km`;
    q("vIpva").textContent = `${(S.ipva*100).toFixed(1).replace(".",",")}%`;
    q("vComb").textContent = `R$ ${S.comb.toFixed(2).replace(".",",")}`;
    q("vKwh").textContent  = `R$ ${S.kwh.toFixed(2).replace(".",",")}`;
    q("vBat").textContent  = `${(S.bat*100).toFixed(1).replace(".",",")}% a.a.`;
    q("vMm").textContent   = S.mmult === 1 ? "como estimado" : (S.mmult>1?"+":"") + Math.round((S.mmult-1)*100) + "%";
    q("vTeto").textContent = S.tetoCusto >= 150000 ? "sem limite" : BRL(S.tetoCusto);
  };

  q("budMin").onchange = e => { S.budMin = +e.target.value;
    if(S.budMax <= S.budMin){ S.budMax = FAIXAS[FAIXAS.indexOf(S.budMin)+1] || 500000; q("budMax").value = S.budMax; }
    render(); };
  q("budMax").onchange = e => { S.budMax = +e.target.value;
    if(S.budMin >= S.budMax){ S.budMin = FAIXAS[Math.max(0,FAIXAS.indexOf(S.budMax)-1)]; q("budMin").value = S.budMin; }
    render(); };
  q("idadeMin").onchange = e => { S.idadeMin = +e.target.value;
    if(S.idadeMax < S.idadeMin){ S.idadeMax = S.idadeMin+1; q("idadeMax").value = S.idadeMax; } render(); };
  q("idadeMax").onchange = e => { S.idadeMax = +e.target.value;
    if(S.idadeMin > S.idadeMax){ S.idadeMin = Math.max(0,S.idadeMax-1); q("idadeMin").value = S.idadeMin; } render(); };
  q("buscaSel").onchange = e => { S.busca = e.target.value; S.sel = null; render(); };
  q("tetoCusto").oninput = e => { S.tetoCusto = +e.target.value; upd(); render(); };

  [["km",v=>S.km=+v],["ipva",v=>S.ipva=+v/1000],["comb",v=>S.comb=+v/100],
   ["kwh",v=>S.kwh=+v/100],["bat",v=>S.bat=+v/1000],["mm",v=>S.mmult=+v/100]]
    .forEach(([id,set])=>{ q(id).oninput = e => { set(e.target.value); upd(); render(); }; });

  ["seg","marca","ene"].forEach(id=>{ q(id).onchange = e => {
    S[id === "seg" ? "seg" : id] = e.target.value; S.sel=null; render(); }; });

  [["soGarantia","soGarantia"],["soConfiavel","soConfiavel"],["soLiquido","soLiquido"],["soCambio","soCambio"]]
    .forEach(([id,k])=>{ q(id).onchange = e => { S[k] = e.target.checked; render(); }; });

  document.querySelectorAll("#chipsH .chip").forEach(b => b.onclick = () => {
    S.H = +b.dataset.h;
    document.querySelectorAll("#chipsH .chip").forEach(x => x.setAttribute("aria-pressed", x===b));
    render();
  });

  q("wreset").onclick = () => { S.w = { custo:34, manut:12, gar:16, conf:10, liq:16, camb:12 }; render(); };
  q("wcusto").onclick = () => { S.w = { custo:50, manut:0, gar:0, conf:0, liq:0, camb:0 }; render(); };

  q("limparTudo").onclick = () => {
    Object.assign(S, PADRAO, {soGarantia:false, soConfiavel:false, soLiquido:false, soCambio:false,
      seg:"todos", marca:"todas", ene:"todas", busca:"", sel:null, listaN:10, verMaisHeat:false});
    q("budMin").value=PADRAO.budMin; q("budMax").value=PADRAO.budMax;
    q("idadeMin").value=PADRAO.idadeMin; q("idadeMax").value=PADRAO.idadeMax;
    q("tetoCusto").value=PADRAO.tetoCusto; q("buscaSel").value=""; q("seg").value="todos"; q("marca").value="todas";
    q("ene").value="todas"; q("km").value=12000; q("ipva").value=20; q("comb").value=620;
    q("kwh").value=95; q("bat").value=25; q("mm").value=100;
    ["soGarantia","soConfiavel","soLiquido","soCambio"].forEach(id=>q(id).checked=false);
    upd(); render();
  };

  // gaveta de filtros
  const dr = q("drawer"), velo = q("velo"), bf = q("btnFiltros");
  const abrir = on => { dr.classList.toggle("on", on); velo.classList.toggle("on", on);
    bf.setAttribute("aria-expanded", on); document.body.style.overflow = on ? "hidden" : "";
    if(on) dr.querySelector("select,input,button").focus(); };
  bf.onclick = () => abrir(!dr.classList.contains("on"));
  q("fecharDrawer").onclick = () => abrir(false);
  q("verResultados").onclick = () => { abrir(false);
    document.getElementById("s-veredito").scrollIntoView({behavior:"smooth"}); };
  velo.onclick = () => abrir(false);
  addEventListener("keydown", e => { if(e.key === "Escape"){ abrir(false); folha(false); } });

  // folha de seções
  const sh = q("sheetSecoes");
  const folha = on => sh.classList.toggle("on", on);
  q("btnSecoes").onclick = () => folha(true);
  sh.querySelectorAll("a,[data-fecha]").forEach(el => el.addEventListener("click", () => folha(false)));

  // tema
  q("theme").onclick = () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", cur ? (cur==="dark"?"light":"dark") : (sysDark?"light":"dark"));
    requestAnimationFrame(render);
  };
  upd();
}

/* ============ rolagem: revelação, progresso, seção atual, parallax ============ */
let obsRev;
function revelar(){
  if(!("IntersectionObserver" in window)) { document.querySelectorAll(".rev").forEach(e=>e.classList.add("vis")); return; }
  if(!obsRev) obsRev = new IntersectionObserver(ents => {
    ents.forEach(e => { if(e.isIntersecting){ e.target.classList.add("vis"); obsRev.unobserve(e.target); } });
  }, {rootMargin:"0px 0px -12% 0px", threshold:.08});
  document.querySelectorAll(".rev:not(.vis)").forEach(e => obsRev.observe(e));
}
function rolagem(){
  const links = [...document.querySelectorAll("#navTopo a")];
  const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const barra = document.getElementById("progresso");
  const passos = [...document.querySelectorAll(".passo")];
  const bolhas = [...document.querySelectorAll(".hero .bolha")];
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let tick = false;
  const onScroll = () => {
    if(tick) return; tick = true;
    requestAnimationFrame(() => {
      const y = scrollY, h = document.body.scrollHeight - innerHeight;
      barra.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y/h) : 0) + ")";
      let atual = null;
      secs.forEach(s => { if(s.getBoundingClientRect().top <= innerHeight*0.35) atual = s.id; });
      links.forEach(a => a.classList.toggle("atual", a.getAttribute("href") === "#"+atual));
      const meio = innerHeight*0.45;
      passos.forEach(p => { const r = p.getBoundingClientRect();
        p.classList.toggle("vis", r.top < meio && r.bottom > 0); });
      if(!reduz && y < innerHeight*1.4)
        bolhas.forEach((b,i) => b.style.transform = `translate3d(0,${y*(i?0.16:0.28)}px,0)`);
      tick = false;
    });
  };
  addEventListener("scroll", onScroll, {passive:true});
  onScroll();
}

bind(); render(); rolagem();
addEventListener("resize", () => { clearTimeout(window._rz); window._rz = setTimeout(render, 220); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if(!document.documentElement.getAttribute("data-theme")) requestAnimationFrame(render);
});
