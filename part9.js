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

  sincronizaQuiz();
  // Um desenho que estoura não pode levar a revelação junto: sem o .vis a página
  // inteira fica com opacity 0. Já aconteceu quando um id sumiu do markup.
  try{
    drawTopo(top, cs); drawESe(top); drawPicks(top, cs); drawTiles(cs, top); drawCriterios();
    drawCurva(); drawRange(cs); drawU();
    drawHeat(top); drawStack(top); drawScatter(cs, top); drawTable(cs);

    const q = id => document.getElementById(id);
    const põe = (id, v) => { const e = q(id); if(e) e.textContent = v; };
    põe("cCount", cs.length); põe("tblCount", cs.length); põe("contRes", cs.length);
    const n = filtrosAtivos();
    põe("contFiltros", n);
    if(q("contFiltros")) q("contFiltros").style.display = n ? "" : "none";
  } catch(err){
    console.error("falha ao desenhar", err);
  }
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
    [...new Set(D.familias.map(f=>famNome(f.nome)))].sort((a,b)=>a.localeCompare(b,"pt-BR")).map(n=>opt(n,n)).join("");
  q("ene").innerHTML = opt("todas","Todos os combustíveis") +
    ["flex","hibrido","eletrico","diesel"].map(e=>opt(e,ENERGIA_NOME[e])).join("");
  q("uf").innerHTML = opt("", "Não informado, usando 2%") +
    Object.keys(IPVA_UF).sort((a,b)=>UF_NOME[a].localeCompare(UF_NOME[b],"pt-BR"))
    .map(u=>opt(u, `${UF_NOME[u]} · ${(IPVA_UF[u]*100).toFixed(2).replace(".",",")}%`)).join("");
  q("uf").value = S.uf; q("ipva").value = Math.round(S.ipva*1000);

  // segmentos: multipla escolha
  const segsTodos = [...new Set(D.familias.map(f=>f.segmento))].sort();
  q("chipsSeg").innerHTML = segsTodos.map(sg=>
    `<button class="chip" type="button" data-seg="${sg}" aria-pressed="false">${segNome(sg)}</button>`).join("");
  q("chipsSeg").querySelectorAll(".chip").forEach(b => b.onclick = () => {
    const k = b.dataset.seg;
    S.segs.has(k) ? S.segs.delete(k) : S.segs.add(k);
    b.setAttribute("aria-pressed", S.segs.has(k)); S.sel=null; upd(); render();
  });

  // marcas: multipla escolha com busca
  const marcasTodas = [...new Set(D.familias.map(f=>f.marca))].sort((a,b)=>a.localeCompare(b,"pt-BR"));
  const contaPorMarca = {}; D.familias.forEach(f => contaPorMarca[f.marca] = (contaPorMarca[f.marca]||0)+1);
  function pintaMarcas(){
    const termo = norm(q("buscaMarca").value);
    const vis = marcasTodas.filter(m => !termo || norm(m).includes(termo));
    q("listaMarcas").innerHTML = vis.length ? vis.map(m =>
      `<label><input type="checkbox" data-marca="${m}"${S.marcas.has(m)?" checked":""}>` +
      `<span>${m}</span><span class="n">${contaPorMarca[m]}</span></label>`).join("")
      : `<p class="vazio">Nenhuma marca com esse nome.</p>`;
    q("listaMarcas").querySelectorAll("input").forEach(c => c.onchange = () => {
      const m = c.dataset.marca;
      c.checked ? S.marcas.add(m) : S.marcas.delete(m);
      S.sel=null; upd(); render();
    });
  }
  q("buscaMarca").oninput = pintaMarcas;

  function upd(){
    q("vKm").textContent   = `${S.km.toLocaleString("pt-BR")} km`;
    q("vIpva").textContent = `${(S.ipva*100).toFixed(2).replace(".",",")}%`;
    q("vComb").textContent = `R$ ${S.comb.toFixed(2).replace(".",",")}`;
    q("vKwh").textContent  = `R$ ${S.kwh.toFixed(2).replace(".",",")}`;
    q("vBat").textContent  = `${(S.bat*100).toFixed(1).replace(".",",")}% a.a.`;
    q("vMm").textContent   = S.mmult === 1 ? "como estimado" : (S.mmult>1?"+":"") + Math.round((S.mmult-1)*100) + "%";
    q("vTeto").textContent = S.tetoCusto >= 150000 ? "sem limite" : BRL(S.tetoCusto);
    q("vSegs").textContent = S.segs.size ? `${S.segs.size} selecionado${S.segs.size>1?"s":""}` : "todos";
    q("vMarcas").textContent = S.marcas.size ? `${S.marcas.size} selecionada${S.marcas.size>1?"s":""}` : "todas";
    q("vEntrada").textContent = `${Math.round(S.entrada*100)}%`;
    q("vJuros").textContent = `${(S.jurosAM*100).toFixed(2).replace(".",",")}% ao mês`;
    q("vPrazo").textContent = `${S.prazo} meses`;
    q("camposFin").hidden = S.pagamento !== "financiado";
    if(S.pagamento === "financiado"){
      const aa = (Math.pow(1+S.jurosAM,12)-1)*100;
      q("dicaFin").innerHTML = `Equivale a <b>${aa.toFixed(1).replace(".",",")}% ao ano</b>. ` +
        `Os juros entram no custo anual e aparecem como camada própria no gráfico de composição.`;
    }
  }
  window._upd = upd;

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
  q("ene").onchange = e => { S.ene = e.target.value; S.sel=null; render(); };

  q("uf").onchange = e => { S.uf = e.target.value; S.ipva = IPVA_UF[S.uf] ?? PADRAO.ipva;
    q("ipva").value = Math.round(S.ipva*1000); upd(); render(); };

  [["km",v=>S.km=+v],["ipva",v=>S.ipva=+v/1000],["comb",v=>S.comb=+v/100],
   ["kwh",v=>S.kwh=+v/100],["bat",v=>S.bat=+v/1000],["mm",v=>S.mmult=+v/100],
   ["entrada",v=>S.entrada=+v/100],["jurosAM",v=>S.jurosAM=+v/10000],["prazo",v=>S.prazo=+v]]
    .forEach(([id,set])=>{ const e=q(id); if(e) e.oninput = ev => { set(ev.target.value); upd(); render(); }; });

  [["soGarantia","soGarantia"],["soConfiavel","soConfiavel"],["soLiquido","soLiquido"],["soCambio","soCambio"]]
    .forEach(([id,k])=>{ q(id).onchange = e => { S[k] = e.target.checked; render(); }; });

  document.querySelectorAll("#chipsPag .chip").forEach(b => b.onclick = () => {
    S.pagamento = b.dataset.pag;
    document.querySelectorAll("#chipsPag .chip").forEach(x => x.setAttribute("aria-pressed", x===b));
    upd(); render();
  });
  document.querySelectorAll("#chipsH .chip").forEach(b => b.onclick = () => {
    S.H = +b.dataset.h;
    document.querySelectorAll("#chipsH .chip").forEach(x => x.setAttribute("aria-pressed", x===b));
    upd(); render();
  });

  q("wreset").onclick = () => { S.w = { custo:34, manut:12, gar:16, conf:10, liq:16, camb:12 }; render(); };
  q("wcusto").onclick = () => { S.w = { custo:50, manut:0, gar:0, conf:0, liq:0, camb:0 }; render(); };

  q("limparTudo").onclick = () => {
    Object.assign(S, PADRAO, {H:5, soGarantia:false, soConfiavel:false, soLiquido:false, soCambio:false,
      ene:"todas", busca:"", sel:null, listaN:10, verMaisHeat:false,
      pagamento:"avista", entrada:0.20, jurosAM:0.018, prazo:48, uf:""});
    S.segs = new Set(); S.marcas = new Set();
    q("budMin").value=PADRAO.budMin; q("budMax").value=PADRAO.budMax;
    q("idadeMin").value=PADRAO.idadeMin; q("idadeMax").value=PADRAO.idadeMax;
    q("tetoCusto").value=PADRAO.tetoCusto; q("buscaSel").value=""; q("ene").value="todas";
    q("uf").value=""; q("ipva").value=Math.round(PADRAO.ipva*1000);
    q("km").value=12000; q("comb").value=620; q("kwh").value=95; q("bat").value=25; q("mm").value=100;
    q("entrada").value=20; q("jurosAM").value=180; q("prazo").value=48; q("buscaMarca").value="";
    ["soGarantia","soConfiavel","soLiquido","soCambio"].forEach(id=>q(id).checked=false);
    document.querySelectorAll("#chipsPag .chip").forEach(x=>x.setAttribute("aria-pressed", x.dataset.pag==="avista"));
    document.querySelectorAll("#chipsH .chip").forEach(x=>x.setAttribute("aria-pressed", +x.dataset.h===5));
    document.querySelectorAll("#chipsSeg .chip").forEach(x=>x.setAttribute("aria-pressed", false));
    pintaMarcas(); upd(); render();
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

  const bConta = q("btnConta");
  if(bConta) bConta.onclick = () => {
    const alvo = q("contaTopo"), abrindo = alvo.hidden;
    alvo.hidden = !abrindo;
    bConta.setAttribute("aria-expanded", abrindo);
    bConta.querySelector(".rot").textContent = abrindo ? "Esconder a conta" : "Ver a conta";
    // fechado: os dois blocos com a mesma altura. aberto: cada um com a sua, senao
    // o bloco da esquerda estica e fica com um vazio enorme
    const dois = alvo.closest(".dois"); if(dois) dois.classList.toggle("aberto", abrindo);
  };
  // os critérios agora moram na gaveta. o atalho abre a gaveta já no grupo certo
  const irAosPesos = e => { if(e) e.stopPropagation(); abrir(true);
    const g = q("grupoCriterios");
    if(g){ g.scrollIntoView({block:"start"}); g.classList.add("piscar");
      setTimeout(()=>g.classList.remove("piscar"), 1400); } };
  if(q("verCriterios")) q("verCriterios").onclick = irAosPesos;
  if(q("irCriterios"))  q("irCriterios").onclick  = irAosPesos;
  addEventListener("keydown", e => { if(e.key === "Escape") abrir(false); });

  // tema
  q("theme").onclick = () => {
    const cur = document.documentElement.getAttribute("data-theme");
    const sysDark = matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", cur ? (cur==="dark"?"light":"dark") : (sysDark?"light":"dark"));
    requestAnimationFrame(render);
  };

  montaQuiz(); pintaMarcas(); upd();
}

/* ============ as três perguntas do herói ============
   O visitante lia o carro do herói como "o melhor carro". Não é: é o melhor para
   um uso. Perguntar antes de responder torna a condição parte da resposta. */
const QUIZ = [
  ["qKm", "km", [[5000,"5 mil"],[12000,"12 mil"],[20000,"20 mil"],[30000,"30 mil"]]],
  ["qH",  "H",  [[3,"3 anos"],[5,"5 anos"],[8,"8 anos"],[10,"10 anos"]]],
  ["qBud","budMax", [[50000,"até 50 mil"],[100000,"até 100 mil"],[200000,"até 200 mil"],[500000,"sem teto"]]]
];
function montaQuiz(){
  for(const [id, chave, ops] of QUIZ){
    const cx = document.getElementById(id); if(!cx) continue;
    cx.innerHTML = ops.map(([v,r]) =>
      `<button class="chip" type="button" data-v="${v}" aria-pressed="${S[chave]===v}">${r}</button>`).join("");
    cx.querySelectorAll(".chip").forEach(b => b.onclick = () => {
      S[chave] = +b.dataset.v;
      espelhaNosFiltros(chave);
      sincronizaQuiz();
      if(window._upd) window._upd();
      render();
    });
  }
}
/* Mexer num filtro tem que refletir nas perguntas, e vice-versa. Sem isso a
   página mostra duas verdades ao mesmo tempo. */
function espelhaNosFiltros(chave){
  const e = document.getElementById(chave === "budMax" ? "budMax" : chave === "km" ? "km" : null);
  if(e) e.value = S[chave];
  if(chave === "H") document.querySelectorAll("#chipsH .chip")
    .forEach(x => x.setAttribute("aria-pressed", +x.dataset.h === S.H));
}
function sincronizaQuiz(){
  for(const [id, chave] of QUIZ){
    const cx = document.getElementById(id); if(!cx) continue;
    cx.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", +b.dataset.v === S[chave]));
  }
}

/* ============ balão de ajuda ============ */
function ajudaBind(){
  let bal = document.getElementById("balao");
  if(!bal){ bal = document.createElement("div"); bal.id = "balao"; bal.setAttribute("role","tooltip");
    document.body.appendChild(bal); }
  let atual = null;
  const esconder = () => { bal.classList.remove("on");
    if(atual) atual.setAttribute("aria-expanded", false); atual = null; };
  const mostrar = b => {
    const txt = AJUDA[b.dataset.ajuda]; if(!txt) return;
    if(atual === b){ esconder(); return; }
    if(atual) atual.setAttribute("aria-expanded", false);
    atual = b; b.setAttribute("aria-expanded", true);
    bal.innerHTML = txt;
    bal.style.left = "0px"; bal.style.top = "0px";      // mede sem influencia da posicao anterior
    bal.classList.add("on");
    const r = b.getBoundingClientRect();
    const bw = bal.offsetWidth, bh = bal.offsetHeight;   // offset ignora a transformacao
    let x = r.left + r.width/2 - bw/2;
    x = Math.max(12, Math.min(x, innerWidth - bw - 12));
    let y = r.bottom + 9;
    if(y + bh > innerHeight - 12) y = Math.max(12, r.top - bh - 9);
    bal.style.left = Math.round(x) + "px"; bal.style.top = Math.round(y) + "px";
  };
  document.addEventListener("pointerover", e => {
    const b = e.target.closest && e.target.closest(".ajuda");
    if(b && matchMedia("(hover:hover)").matches) mostrar(b);
  });
  document.addEventListener("pointerout", e => {
    const b = e.target.closest && e.target.closest(".ajuda");
    if(b && matchMedia("(hover:hover)").matches && !bal.matches(":hover")) esconder();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest && e.target.closest(".ajuda");
    if(b){ e.preventDefault(); e.stopPropagation(); mostrar(b); }
    else if(!e.target.closest || !e.target.closest("#balao")) esconder();
  });
  document.addEventListener("focusin", e => {
    const b = e.target.closest && e.target.closest(".ajuda");
    if(b) mostrar(b);
  });
  addEventListener("keydown", e => { if(e.key === "Escape") esconder(); });
  let ignoraScroll = 0;
  addEventListener("scroll", () => { if(Date.now() > ignoraScroll) esconder(); }, {passive:true});
  window._ajudaIgnoraScroll = () => { ignoraScroll = Date.now() + 400; };
}

/* ============ rolagem: revelação, progresso, seção atual, parallax ============ */
let obsRev;
function revelarTudo(){ document.querySelectorAll(".rev:not(.vis)").forEach(e=>e.classList.add("vis")); }
function revelar(){
  if(!("IntersectionObserver" in window)){ revelarTudo(); return; }
  if(!obsRev) obsRev = new IntersectionObserver(ents => {
    ents.forEach(e => { if(e.isIntersecting){ e.target.classList.add("vis"); obsRev.unobserve(e.target); } });
  }, {rootMargin:"0px 0px -12% 0px", threshold:.08});
  document.querySelectorAll(".rev:not(.vis)").forEach(e => {
    // ja visivel na carga: revela na hora, sem depender do observador
    const r = e.getBoundingClientRect();
    if(r.top < innerHeight && r.bottom > 0) e.classList.add("vis");
    else obsRev.observe(e);
  });
  // rede de seguranca: conteudo nunca pode ficar invisivel por falha do observador
  clearTimeout(window._revFallback);
  window._revFallback = setTimeout(revelarTudo, 1500);
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

bind(); render(); rolagem(); ajudaBind();
addEventListener("resize", () => { clearTimeout(window._rz); window._rz = setTimeout(render, 220); });
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if(!document.documentElement.getAttribute("data-theme")) requestAnimationFrame(render);
});
