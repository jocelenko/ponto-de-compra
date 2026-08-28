/* ============ 6. veredicto ============ */
function garSelo(c){
  if(c.garMeses >= 24) return `<span class="selo g">${c.garMeses} meses de garantia</span>`;
  if(c.garMeses > 0)   return `<span class="selo w">${c.garMeses} meses de garantia</span>`;
  return `<span class="selo">Sem garantia</span>`;
}
function riscoSelo(c){
  const cls = c.risco <= 1 ? "g" : c.risco <= 2 ? "" : c.risco <= 3 ? "w" : "c";
  const t   = c.risco <= 1 ? "Câmbio robusto" : c.risco <= 2 ? "Câmbio ok"
            : c.risco <= 3 ? "Câmbio pede atenção" : "Câmbio arriscado";
  return `<span class="selo ${cls}">${t}</span>`;
}
function eneSelo(c){
  const extra = c.energia === "eletrico" ? `${dec(c.kwh100)} kWh/100 km`
              : (c.kml ? `${dec(c.kml)} km/l` : "");
  return `<span class="selo">${ENERGIA_NOME[c.energia]||c.energia}${extra?" · "+extra:""}</span>`;
}
function avisoSelos(c){
  let h = "";
  if(c.curvaEst)   h += `<span class="selo w">Curva estimada</span>`;
  else if(c.curto) h += `<span class="selo w">Histórico curto</span>`;
  return h;
}

/* ---------- por que este carro ganhou, em uma frase ---------- */
const DIM_FRASE = {
  custo: c => `custa ${BRL(c.total)} por ano${c.juros>0?", já com os juros do financiamento":""}, um dos mais baratos de manter da sua faixa`,
  manut: c => `a manutenção sai por volta de ${BRL(c.manut)} ao ano, abaixo da média`,
  gar:   c => `ainda chega com ${c.garMeses} meses de garantia de fábrica`,
  conf:  c => `entrega bom nível de conforto e itens para o preço`,
  liq:   c => `é fácil de revender, sai rápido quando você anuncia`,
  camb:  c => `o câmbio é dos mais confiáveis do mercado`
};
function motivoDe(c, cs){
  if(!c || !c.dim) return "";
  const fortes = Object.entries(c.dim).sort((a,b)=>b[1]-a[1]).filter(([,v])=>v>=55).slice(0,2);
  if(!fortes.length) return `Lidera no conjunto de critérios, sem se destacar em nenhum isoladamente.`;
  const partes = fortes.map(([k])=>DIM_FRASE[k](c));
  const melhorCusto = cs && cs.length ? Math.min(...cs.map(x=>x.total)) : null;
  const extra = (melhorCusto !== null && c.total <= melhorCusto*1.05)
    ? ` É também o menor custo por ano entre os candidatos filtrados.` : "";
  return `Ganha porque ${partes.join(", e ")}.${extra}`;
}

/* Extrato vertical: cada componente, uma regua, o total. Deixa a soma explicita. */
const LINHAS_CONTA = [
  ["deprec","Depreciação","--s1","O que o carro perde de valor, medido na curva da FIPE"],
  ["manut","Manutenção","--s2","Oficina, revisão e, em elétrico, provisão de bateria"],
  ["seguro","Seguro","--s3","Percentual do valor FIPE por ano"],
  ["ipva","IPVA","--s4","Alíquota do estado sobre o valor médio no período"],
  ["comb","Energia","--s5","Combustível ou eletricidade"],
  ["juros","Juros do financiamento","--s6","Só entra se você marcar financiado"]
];
function montaConta(c){
  if(!c) return "";
  const linhas = LINHAS_CONTA.map(([k,nome,cor,dica])=>{
    const v = c[k] || 0;
    if(k === "juros" && v <= 0 && S.pagamento !== "financiado") return "";
    return `<div class="l${v<=0?" zero":""}" title="${dica}">` +
      `<span class="nome"><i class="marca" style="background:var(${cor})"></i>${nome}</span>` +
      `<span class="pt"></span><span class="v">${v>0?BRL(v):"não entra"}</span></div>`;
  }).join("");
  const anos = contaPorAno(c);
  const pri = anos.length ? anos[0].total : c.total;
  const ult = anos.length ? anos[anos.length-1].total : c.total;
  const variacao = anos.length > 1 ? `
    <p class="rodape"><b>Esta é a média dos ${S.H} anos, e os anos não são iguais.</b>
    O primeiro sai por volta de <b>${BRL(pri)}</b> e o último por volta de <b>${BRL(ult)}</b>,
    porque o carro perde mais valor no começo e pede mais oficina no fim.</p>` : "";
  return linhas +
    `<div class="soma"><span class="nome">Média por ano</span><span class="pt"></span>` +
    `<span class="v">${BRL(c.total)}</span></div>` +
    `<div class="soma periodo"><span class="nome">Total em ${S.H} anos</span><span class="pt"></span>` +
    `<span class="v">${BRL(c.total*S.H)}</span></div>` +
    variacao +
    `<p class="rodape">Não entram entrada, licenciamento, multas nem estacionamento.</p>`;
}

/* O visitante lia o carro do herói como "o melhor carro". Não é: é o melhor sob
   as condições que ele respondeu. Este bloco procura a virada de verdade em vez de
   supor que a rodagem basta, porque com os pesos equilibrados o mesmo carro ganha
   em quase toda faixa de quilometragem. Se nenhuma condição virar, ele diz isso,
   que é informação e não enfeite. */
/* A prioridade é a dimensão que mais troca o vencedor, então ela vem primeiro.
   Testar só rodagem dava a impressão falsa de que a resposta era estável. */
const PERFIS = [
  ["perfil","custo",    "você olhasse só o custo por ano",            "Gastar o mínimo"],
  ["perfil","problema", "o que pesasse fosse o menor risco mecânico", "Menos risco mecânico"],
  ["perfil","revenda",  "o que pesasse fosse revender fácil",         "Revender fácil depois"],
  ["perfil","conforto", "o que pesasse fosse conforto e equipamento", "Conforto e equipamento"],
  ["budMax",  50000, "seu teto de compra fosse R$ 50 mil"],
  ["budMax", 100000, "seu teto de compra fosse R$ 100 mil"],
  ["km",       5000, "você rodasse 5 mil km por ano"],
  ["km",      30000, "você rodasse 30 mil km por ano"],
  ["H",          10, "você ficasse 10 anos com o carro"],
  ["H",           3, "você ficasse só 3 anos com o carro"]
];
function melhorSob(mudanca){
  const antes = {};
  for(const k in mudanca){
    antes[k] = k === "w" ? Object.assign({}, S.w) : S[k];
    S[k] = mudanca[k];
  }
  const w = pontuar(candidatos(false)).sort((a,b)=>b.score-a.score)[0];
  for(const k in antes) S[k] = antes[k];
  return w;
}
// mudar de prioridade e mudar o objeto de pesos inteiro, nao uma chave solta
function mudancaDe(chave, valor){
  if(chave !== "perfil") return {[chave]: valor};
  const p = PERFIS_PESO[valor];
  return p ? {perfil: valor, w: Object.assign({}, p.w)} : null;
}
function drawESe(top){
  const alvo = document.getElementById("eSe"); if(!alvo) return;
  const atual = top[0];
  if(!atual){ alvo.hidden = true; return; }
  const mesmo = c => c && c.fam === atual.fam && c.ano === atual.ano;

  let achado = null;
  for(const [chave, valor, frase, rotPeso] of PERFIS){
    if(S[chave] === valor) continue;
    const mud = mudancaDe(chave, valor); if(!mud) continue;
    const o = melhorSob(mud);
    if(o && !mesmo(o)){
      achado = {o, frase, mud, rot: rotPeso || rotuloPerfil(chave, valor)};
      break;
    }
  }

  alvo.hidden = false;
  if(!achado){
    alvo.innerHTML = `<div class="cab">${iconeAviso()}Testado contra outros perfis</div>` +
      `<p>Este carro continuou em primeiro em todas as combinações que testamos agora. ` +
      `Isso é raro e não vale para todo mundo: mexa nos pesos dentro dos filtros e a ordem muda.</p>`;
    return;
  }
  alvo.innerHTML = `<div class="cab">${iconeAviso()}Este não é "o melhor carro"</div>` +
    `<p>É o melhor <b>para o que você respondeu</b>. Se ${achado.frase}, o primeiro lugar já seria outro:</p>` +
    `<div class="troca"><span class="car">${famNome(achado.o.fam)} ${achado.o.ano}</span>` +
    `<span class="seta">·</span><span class="val">${BRL(achado.o.total)}/ano</span></div>` +
    `<button class="tbtn btnTroca" type="button" id="testarAlt">Ver com ${achado.rot}</button>`;
  const b = document.getElementById("testarAlt");
  if(b) b.onclick = () => {
    Object.assign(S, achado.mud);
    if(achado.mud.perfil) S.resp.perfil = true;
    if(achado.mud.budMax){ const e = document.getElementById("budMax"); if(e) e.value = S.budMax; }
    if(achado.mud.km){ const e = document.getElementById("km"); if(e) e.value = S.km; }
    if(achado.mud.H) document.querySelectorAll("#chipsH .chip")
      .forEach(x => x.setAttribute("aria-pressed", +x.dataset.h === S.H));
    if(window._upd) window._upd();
    render();
    document.querySelector(".placa").scrollIntoView({behavior:"smooth", block:"center"});
  };
}
function rotuloPerfil(chave, valor){
  if(chave === "km")  return valor.toLocaleString("pt-BR") + " km por ano";
  if(chave === "H")   return valor + " anos";
  return "teto de " + BRL(valor);
}
function iconeAviso(){
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">` +
    `<circle cx="8" cy="8" r="6.5"/><path d="M8 4.6v4M8 11.1v.3"/></svg>`;
}

function drawTopo(top, cs){
  const q = id => document.getElementById(id);
  const c = top[0];
  if(!c){ q("topNome").textContent = "Nenhum carro passa nesse filtro";
    q("topPorque").textContent = "Afrouxe alguma exigência no painel de filtros.";
    q("topPreco").textContent = "–"; q("topCusto").textContent = "–"; return; }
  q("topNome").innerHTML = `${famNome(c.fam)} <span class="ano">${c.ano}</span>`;
  q("topPorque").innerHTML = motivoDe(c, cs);
  q("topPreco").textContent = BRL(c.preco);
  q("topCusto").textContent = BRL(c.total);
  q("topAnos").textContent = S.H;
  const conta = q("contaTopo"); if(conta) conta.innerHTML = montaConta(c);
  const ft = q("fitaTxt");
  if(ft) ft.textContent = `Para quem roda ${S.km.toLocaleString("pt-BR")} km e fica ${S.H} anos com o carro`;
}

function drawPicks(top, cs){
  const host = document.getElementById("picks");
  if(!top.length){ host.innerHTML = `<p class="cartao">Nenhum modelo passa nesse filtro. Afrouxe alguma exigência.</p>`; return; }
  host.innerHTML = top.slice(0,3).map((c,i)=>`
    <article class="cartao${i?"":" top"} rev d${i}">
      <span class="pos">${i+1}º</span>
      <h3>${famNome(c.fam)} <span class="ano">${c.ano}</span></h3>
      <div class="big"><span class="v">${est(BRL(c.total),"Estimado pelo Ponto de Compra. Soma depreciação, IPVA, seguro, manutenção, energia e juros sob as premissas atuais.")}</span><span class="u">por ano${ajuda("custoAno","O que entra no custo por ano")}</span></div>
      <p class="motivo">${motivoDe(c, cs)}</p>
      <div class="selos">${garSelo(c)}${eneSelo(c)}${riscoSelo(c)}${avisoSelos(c)}</div>
      <dl class="ficha">
        <dt>Preço FIPE hoje${ajuda("precoFipe","O que é o preço FIPE")}</dt><dd>${BRL(c.preco)}</dd>
        <dt>Revenda em ${S.H} anos</dt><dd>${est(BRL(c.revenda),"Projeção. Assume que a curva de hoje continua valendo.")}</dd>
        <dt>Perde no período</dt><dd>${est(PCT(c.depPct),"Projeção sobre a curva medida na FIPE.")}</dd>
        <dt>Manutenção</dt><dd>${est(BRL(c.manut)+"/ano","Base por marca, corrigida por idade, porte e trem de força.")}</dd>
        <dt>Custo por km</dt><dd>${est("R$ "+c.custoKm.toFixed(2).replace(".",","),"Custo anual dividido pela rodagem definida nos filtros.")}</dd>
      </dl>
      <div class="notas" title="Nota de 0 a 100 em cada critério, relativa aos candidatos filtrados">
        ${DIMS.map(([k,n])=>{ const v = Math.round(c.dim ? c.dim[k] : 0);
          return `<span class="d ${v>=50?"alta":"baixa"}" title="${n}: nota ${v} de 100"><em>${n}</em><i><b style="width:${Math.max(4,v)}%"></b></i></span>`;
        }).join("")}
      </div>
    </article>`).join("");
}

function drawTiles(cs, top){
  const q = (a,p)=>{ const v=a.slice().sort((x,y)=>x-y); return v[Math.min(v.length-1,Math.floor(p*(v.length-1)))]; };
  const byI = {};
  cs.forEach(c => (byI[c.idade] = byI[c.idade] || []).push(c));
  const idades = Object.keys(byI).map(Number).sort((a,b)=>a-b);
  const meds = idades.map(i => q(byI[i].map(c=>c.total), .5));
  const varIdade  = meds.length>1 ? 100*(Math.max(...meds)/Math.min(...meds)-1) : 0;
  const varModelo = idades.length ? idades.reduce((a,i)=>{
      const t = byI[i].map(c=>c.total); return a + 100*(Math.max(...t)/Math.min(...t)-1); },0)/idades.length : 0;
  const barato = cs.length ? cs.reduce((a,b)=>b.total<a.total?b:a) : null;
  const novos = cs.filter(c=>c.idade<=1), semi = cs.filter(c=>c.idade>=2&&c.idade<=4);
  const medOf = a => a.length ? q(a.map(c=>c.total), .5) : null;
  const mN = medOf(novos), mS = medOf(semi);
  const econ = (mN && mS) ? (1 - mS/mN)*100 : null;
  const comGar = cs.filter(c=>c.garMeses>0).length;
  const razao = varIdade>0 ? (varModelo/varIdade) : null;
  document.getElementById("tiles").innerHTML = `
    <div class="stat"><div class="lab">Mais barato de ter${ajuda("custoAno","O que entra no custo por ano")}</div>
      <div class="v">${barato?BRL(barato.total):"–"}</div>
      <div class="n">${barato?`<b>${famNome(barato.fam)} ${barato.ano}</b>, comprando por ${BRL(barato.preco)}. Nem sempre o mais barato de comprar é o mais barato de ter.`:""}</div></div>
    <div class="stat"><div class="lab">Modelo contra ano</div>
      <div class="v">${razao?razao.toFixed(1).replace(".",",")+"x":"–"}</div>
      <div class="n">Trocar de <b>modelo</b> mexe ${razao?razao.toFixed(1).replace(".",","):"–"} vezes mais no custo anual do que trocar de <b>ano</b>.</div></div>
    <div class="stat"><div class="lab">Semi-novo contra quase zero</div>
      <div class="v">${econ!==null?(econ>=0?"−":"+")+PCT(Math.abs(econ)):"–"}</div>
      <div class="n">${econ!==null?`Um carro de 2 a 4 anos custa ${PCT(Math.abs(econ))} ${econ>=0?"menos":"mais"} por ano que um de até 1 ano. Real, mas menor do que a fama diz.`:"Sem base de comparação no filtro atual."}</div></div>
    <div class="stat"><div class="lab">Ainda em garantia</div>
      <div class="v">${comGar}<small> de ${cs.length}</small></div>
      <div class="n">Combinações de modelo e ano no seu filtro que chegam com garantia de fábrica ativa.</div></div>`;
}

/* ---------- critérios, com peso ajustável ---------- */
const CRIT_INFO = [
  ["custo","Custo por ano","Soma depreciação, IPVA, seguro, manutenção, energia e, se for financiado, os juros. Dividido pelos anos de posse. É o número grande de cada cartão.","FIPE mais estimativas"],
  ["manut","Manutenção barata","Só a linha de oficina e revisão, separada do custo total. Base por marca, corrigida por idade, porte e trem de força.","Estimativa de mercado"],
  ["gar","Garantia de fábrica","Meses de garantia que ainda sobram quando o carro chega na sua mão. Hyundai e as chinesas largam na frente por darem 5 e 6 anos.","Política de cada marca"],
  ["conf","Conforto e itens","Aproximação por porte do carro somada ao ano, já que multimídia, câmera e assistentes viraram série em épocas diferentes.","Aproximação, o critério mais fraco"],
  ["liq","Revenda fácil","Nota de 1 a 5 de liquidez, ou seja, quão rápido o modelo sai quando você anuncia. Onix e HB20 giram muito, importado de nicho não gira.","Histórico de mercado"],
  ["camb","Câmbio confiável","Nota de 1 a 5 de risco da transmissão. Conversor de torque e redutor de elétrico são os mais seguros. Dupla embreagem seca é o mais arriscado.","Histórico de mercado"]
];
function drawBarraPesos(){
  const alvo = document.getElementById("barraPesos"); if(!alvo) return;
  const soma = Object.values(S.w).reduce((a,b)=>a+b,0) || 1;
  const ordem = CRIT_INFO.filter(([k])=>S.w[k] > 0);
  alvo.innerHTML = ordem.map(([k,nome],i)=>{
    const pct = S.w[k]/soma*100;
    return `<i style="width:${pct}%;background:var(${SERIES[i%6]})" title="${nome}: ${Math.round(pct)}%">` +
      `${pct >= 13 ? `<span style="color:${inkPara(SERIES[i%6])}">${Math.round(pct)}%</span>` : ""}</i>`;
  }).join("") || `<i style="width:100%;background:var(--ink-3)"><span>sem peso definido</span></i>`;
  let leg = alvo.nextElementSibling;
  if(!leg || !leg.classList.contains("pesosLeg")){
    leg = document.createElement("div"); leg.className = "pesosLeg";
    alvo.insertAdjacentElement("afterend", leg);
  }
  leg.innerHTML = ordem.map(([k,nome],i)=>
    `<span><i style="background:var(${SERIES[i%6]})"></i>${nome} ${Math.round(S.w[k]/soma*100)}%</span>`).join("");
}

function drawCriterios(){
  const soma = Object.values(S.w).reduce((a,b)=>a+b,0) || 1;
  document.getElementById("critGrade").innerHTML = CRIT_INFO.map(([k,nome,exp,fonte])=>`
    <div class="crit">
      <div class="cima"><h4>${nome}</h4><span class="peso">${Math.round(S.w[k]/soma*100)}%</span></div>
      <p>${exp}</p>
      <span class="fonte">${fonte}</span>
      <input type="range" id="w_${k}" min="0" max="50" step="2" value="${S.w[k]}" aria-label="Peso de ${nome}">
    </div>`).join("");
  Object.keys(S.w).forEach(k=>{ const e=document.getElementById("w_"+k);
    if(e) e.oninput = ev => { S.w[k] = +ev.target.value; S.perfil = null; render(); }; });
  drawBarraPesos();
}

/* ============ 7. tabela ============ */
const COLS = [
  {k:"fam",   n:"Modelo",     l:1}, {k:"ano", n:"Ano"}, {k:"idade", n:"Idade"},
  {k:"preco", n:"Preço FIPE", aj:"precoFipe"}, {k:"total", n:"Custo/ano", bar:1, aj:"custoAno"},
  {k:"deprec",n:"Deprec."},    {k:"manut", n:"Manut."},  {k:"depPct", n:"% perdido"},
  {k:"garMeses", n:"Garantia"},{k:"liq", n:"Liquidez"},  {k:"score", n:"Score", aj:"score"}
];
function drawTable(cs){
  const estreito = window.innerWidth < 760;
  const COLS_USO = estreito
    ? COLS.filter(c=>["fam","ano","preco","total","score"].includes(c.k))
    : COLS;
  const d = S.sort.d, k = S.sort.k;
  const rows = cs.slice().sort((a,b)=> typeof a[k]==="string" ? d*a[k].localeCompare(b[k]) : d*(a[k]-b[k]));
  const maxT = Math.max(...cs.map(c=>c.total), 1);
  let h = `<table class="rk"${estreito?' style="min-width:0"':""}><thead><tr>` + COLS_USO.map(c=>
    `<th class="${c.l?"l":""}" ${k===c.k?`aria-sort="${d<0?"descending":"ascending"}"`:""}>` +
    `<span class="thin"><button type="button" data-k="${c.k}">${c.n}${k===c.k?` <span class="ar">${d<0?"▼":"▲"}</span>`:""}</button>` +
    `${c.aj?ajuda(c.aj):""}</span></th>`).join("") + `</tr></thead><tbody>`;
  const LIM_T = Math.min(S.listaN, rows.length);
  rows.slice(0,LIM_T).forEach(c=>{
    const sel = S.sel && S.sel.fam===c.fam && S.sel.ano===c.ano;
    h += `<tr class="${sel?"sel":""}" data-f="${c.fam}" data-a="${c.ano}">
      <td class="l"><span class="nm">${famNome(c.fam)}</span><span class="sg"> · ${segNome(c.seg)}</span></td>
      <td>${c.ano}</td>${estreito?"":`<td>${c.idade}a</td>`}<td>${BRL(c.preco)}</td>
      <td class="bararea"><span class="fill" style="width:${(c.total/maxT*100).toFixed(1)}%"></span><span class="est" title="Estimado pelo Ponto de Compra">${BRL(c.total)}</span></td>
      ${estreito?"":`<td><span class="est" title="Estimado pelo Ponto de Compra">${BRL(c.deprec)}</span></td><td><span class="est" title="Estimado pelo Ponto de Compra">${BRL(c.manut)}</span></td><td><span class="est" title="Estimado pelo Ponto de Compra">${c.depPct.toFixed(0)}%</span></td>
      <td>${c.garMeses?c.garMeses+"m":"–"}</td><td>${"●".repeat(c.liq)}<span style="opacity:.25">${"●".repeat(5-c.liq)}</span></td>`}
      <td><b>${c.score.toFixed(0)}</b></td></tr>`;
  });
  h += `</tbody></table>`;
  const host = document.getElementById("tbl");
  host.innerHTML = cs.length ? h : `<p style="padding:20px;color:var(--ink-2)">Nenhum candidato passa nesse filtro.</p>`;
  if(rows.length > LIM_T){
    const resta = rows.length - LIM_T;
    const bloco = document.createElement("div");
    bloco.className = "maisLista";
    bloco.innerHTML = `<span>Mostrando ${LIM_T} de ${rows.length}</span>`;
    const mais = document.createElement("button");
    mais.className = "tbtn"; mais.type = "button";
    mais.textContent = resta > 10 ? "Ver mais 10" : `Ver os últimos ${resta}`;
    mais.onclick = () => {
      S.listaN += 10;
      const y = host.getBoundingClientRect().top;
      drawTable(cs);                                  // so a lista, sem redesenhar a pagina toda
      window.scrollBy(0, host.getBoundingClientRect().top - y);
    };
    bloco.appendChild(mais);
    if(resta > 10){
      const todos = document.createElement("button");
      todos.className = "tbtn"; todos.type = "button";
      todos.textContent = `Ver todos os ${rows.length}`;
      todos.onclick = () => { S.listaN = rows.length; drawTable(cs); };
      bloco.appendChild(todos);
    }
    host.appendChild(bloco);
  }
  host.querySelectorAll("th button").forEach(b=>b.onclick = ()=>{
    const kk = b.dataset.k;
    S.sort = {k:kk, d: S.sort.k===kk ? -S.sort.d : (kk==="fam"?1:-1)};
    render();
  });
  host.querySelectorAll("tbody tr").forEach(tr=>tr.onclick = ()=>{
    S.sel = {fam:tr.dataset.f, ano:+tr.dataset.a};
    S.curvas.forEach(x=>{ if(x.nome===tr.dataset.f) x.on = true; });
    render();
  });
  document.getElementById("tblCount").textContent = cs.length;
}
