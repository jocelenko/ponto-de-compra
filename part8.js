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
}

function drawPicks(top, cs){
  const host = document.getElementById("picks");
  if(!top.length){ host.innerHTML = `<p class="cartao">Nenhum modelo passa nesse filtro. Afrouxe alguma exigência.</p>`; return; }
  host.innerHTML = top.slice(0,3).map((c,i)=>`
    <article class="cartao${i?"":" top"} rev d${i}">
      <span class="pos">${i+1}º</span>
      <h3>${famNome(c.fam)} <span class="ano">${c.ano}</span></h3>
      <div class="big"><span class="v">${est(BRL(c.total),"Estimado pelo Ponto de Compra. Soma depreciação, IPVA, seguro, manutenção, energia e juros sob as premissas atuais.")}</span><span class="u">por ano</span></div>
      <p class="motivo">${motivoDe(c, cs)}</p>
      <div class="selos">${garSelo(c)}${eneSelo(c)}${riscoSelo(c)}${avisoSelos(c)}</div>
      <dl class="ficha">
        <dt>Preço FIPE hoje</dt><dd>${BRL(c.preco)}</dd>
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
    <div class="stat"><div class="lab">Mais barato de ter</div>
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
    if(e) e.oninput = ev => { S.w[k] = +ev.target.value; render(); }; });
}

/* ============ 7. tabela ============ */
const COLS = [
  {k:"fam",   n:"Modelo",     l:1}, {k:"ano", n:"Ano"}, {k:"idade", n:"Idade"},
  {k:"preco", n:"Preço FIPE"}, {k:"total", n:"Custo/ano", bar:1},
  {k:"deprec",n:"Deprec."},    {k:"manut", n:"Manut."},  {k:"depPct", n:"% perdido"},
  {k:"garMeses", n:"Garantia"},{k:"liq", n:"Liquidez"},  {k:"score", n:"Score"}
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
    `<th class="${c.l?"l":""}" ${k===c.k?`aria-sort="${d<0?"descending":"ascending"}"`:""}><button type="button" data-k="${c.k}">${c.n}${k===c.k?` <span class="ar">${d<0?"▼":"▲"}</span>`:""}</button></th>`).join("") + `</tr></thead><tbody>`;
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
