/* ============ estado ============ */
const S = {
  budMin: 10000, budMax: 500000, H: 5, km: 12000, ipva: 0.02, comb: 6.20, kwh: 0.95, bat: 0.025, mmult: 1.0,
  segs: new Set(), marcas: new Set(), ene: "todas", busca: "", sel: null,
  pagamento: "avista", entrada: 0.20, jurosAM: 0.018, prazo: 48, uf: "",
  idadeMin: 0, idadeMax: 16, tetoCusto: 150000, verMaisHeat: false, listaN: 10,
  soGarantia: false, soConfiavel: false, soLiquido: false, soCambio: false, sort: {k:"score", d:-1},
  w: { custo:34, manut:12, gar:16, conf:10, liq:16, camb:12 },
  curvas: null
};
const BRL = n => "R$ " + Math.round(n).toLocaleString("pt-BR");
const BRLk = n => "R$ " + (Math.round(n/100)/10).toFixed(1).replace(".",",") + "k";
const PCT = n => n.toFixed(0) + "%";
const SERIES = ["--s1","--s2","--s3","--s4","--s5","--s6"];
/* Aliquota de IPVA para automovel de passeio a gasolina ou flex, por unidade da federacao.
   Varia por combustivel e por lei estadual, entao serve de ponto de partida ajustavel. */
const IPVA_UF = {
  AC:0.02, AL:0.03, AP:0.03, AM:0.03, BA:0.025, CE:0.03, DF:0.035, ES:0.02, GO:0.0375,
  MA:0.025, MT:0.03, MS:0.03, MG:0.04, PA:0.025, PB:0.025, PR:0.035, PE:0.03, PI:0.025,
  RJ:0.04, RN:0.03, RS:0.03, RO:0.03, RR:0.03, SC:0.02, SP:0.04, SE:0.025, TO:0.02
};
const UF_NOME = {AC:"Acre",AL:"Alagoas",AP:"Amapá",AM:"Amazonas",BA:"Bahia",CE:"Ceará",
  DF:"Distrito Federal",ES:"Espírito Santo",GO:"Goiás",MA:"Maranhão",MT:"Mato Grosso",
  MS:"Mato Grosso do Sul",MG:"Minas Gerais",PA:"Pará",PB:"Paraíba",PR:"Paraná",
  PE:"Pernambuco",PI:"Piauí",RJ:"Rio de Janeiro",RN:"Rio Grande do Norte",
  RS:"Rio Grande do Sul",RO:"Rondônia",RR:"Roraima",SC:"Santa Catarina",SP:"São Paulo",
  SE:"Sergipe",TO:"Tocantins"};

/* Juros do financiamento diluidos no periodo de posse.
   Price system: parcela fixa, entrada em percentual, prazo em meses. */
function jurosPorAno(preco){
  if (S.pagamento !== "financiado") return 0;
  const pv = preco * (1 - S.entrada);
  const i = S.jurosAM, n = S.prazo;
  if (pv <= 0 || n <= 0) return 0;
  const pmt = i > 0 ? pv * i / (1 - Math.pow(1+i, -n)) : pv / n;
  const jurosTotal = pmt * n - pv;
  const anosDeParcela = n / 12;
  const pagosNoPeriodo = Math.min(anosDeParcela, S.H) / anosDeParcela;   // se vender antes, quita o saldo
  return jurosTotal * pagosNoPeriodo / S.H;
}
const SEGN = {"Hatch compacto":"Hatch compacto","Sedan compacto":"Sedã compacto",
  "SUV compacto":"SUV compacto","Monovolume 7L":"Monovolume 7 lugares",
  "Sedan medio":"Sedã médio","SUV medio":"SUV médio","Compacto":"Compacto",
  "Medio":"Médio","SUV":"SUV","Picape":"Picape","Grande":"Grande","Premium":"Premium"};
const segNome = s => SEGN[s] || s;
const famNome = n => n.replace(/ Eletrico$/, " Elétrico").replace(/ Hibrido$/, " Híbrido");
const dec = v => String(v).replace(".", ",");
// marca um numero como estimado, para nunca confundir com medicao da FIPE
// escolhe a tinta pela luminancia real do degrau, e nao por limiar fixo
function inkPara(varName){
  const c = cssv(varName).trim();
  let m = c.startsWith("#")
    ? c.slice(1).match(/../g).map(h=>parseInt(h,16))
    : (c.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number);
  const lin = m.map(v=>{ v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); });
  const L = 0.2126*lin[0] + 0.7152*lin[1] + 0.0722*lin[2];
  return L > 0.17 ? "#0E1013" : "#F4F6F8";
}
const PADRAO = {budMin:10000, budMax:500000, idadeMin:0, idadeMax:16, tetoCusto:150000,
  km:12000, ipva:0.02, comb:6.20, kwh:0.95, bat:0.025, mmult:1.0};
function filtrosAtivos(){
  let n = 0;
  if (S.budMin !== PADRAO.budMin || S.budMax !== PADRAO.budMax) n++;
  if (S.idadeMin !== PADRAO.idadeMin || S.idadeMax !== PADRAO.idadeMax) n++;
  if (S.tetoCusto !== PADRAO.tetoCusto) n++;
  ["soGarantia","soConfiavel","soLiquido","soCambio"].forEach(k=>{ if(S[k]) n++; });
  if (S.segs.size) n++; if (S.marcas.size) n++; if (S.ene !== "todas") n++;
  if (S.pagamento !== "avista") n++;
  if (S.busca) n++;
  if (S.km !== PADRAO.km || S.ipva !== PADRAO.ipva || S.comb !== PADRAO.comb
      || S.kwh !== PADRAO.kwh || S.bat !== PADRAO.bat || S.mmult !== PADRAO.mmult) n++;
  return n;
}
/* Ajuda contextual. Um unico balao no body, posicionado por JS, para nunca ser
   cortado por container com overflow. */
const AJUDA = {
  custoAno: `<b>O custo por ano de posse soma seis coisas.</b>
    <ul><li>O que o carro <b>perde de valor</b>, medido na curva da FIPE</li>
    <li><b>IPVA</b>, pela alíquota do seu estado</li>
    <li><b>Seguro</b></li>
    <li><b>Manutenção</b>, mais provisão de bateria se for elétrico</li>
    <li><b>Energia</b>: combustível ou eletricidade</li>
    <li><b>Juros</b>, se você marcar financiado</li></ul>
    Tudo dividido pelo tempo que você fica com o carro. Não entram entrada,
    licenciamento, multas nem estacionamento.`,
  precoFipe: `<b>É o valor da Tabela FIPE de hoje</b> para uma versão típica desse modelo e ano.
    Não é preço de loja: negociação, cor, quilometragem e estado real mexem uns 10% para cada lado.`,
  score: `<b>Nota de 0 a 100</b> na média ponderada dos seis critérios, sempre relativa aos candidatos
    do seu filtro atual. Abra <b>Critérios</b> no topo para mexer nos pesos.`
};
function ajuda(chave, rotulo){
  return `<button class="ajuda" type="button" data-ajuda="${chave}" aria-expanded="false"` +
    ` aria-label="${rotulo || "O que entra nesse número"}">?</button>`;
}
const est = (txt, motivo) => `<span class="est" title="Estimado pelo Ponto de Compra. ${motivo}">${txt}</span>`;
const norm = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
const DIMS = [["custo","Custo"],["manut","Manut"],["gar","Garan"],
              ["conf","Confo"],["liq","Reven"],["camb","Câmb"]];
const cssv = v => getComputedStyle(document.body).getPropertyValue(v).trim();

/* ============ motor de custo ============ */
function multIdade(a){ for(const [lim,m] of D.multIdade) if(a<=lim) return m; return 3.8; }
function idadeMin(f){
  if (f._imin === undefined){
    let mx = -Infinity; for (const a in f.serie) mx = Math.max(mx, +a);
    f._imin = Math.max(0, D.anoRef - mx);
  }
  return f._imin;
}
function relIdade(f, idade){
  const R = f.retencao;
  const lo = idadeMin(f);
  if (idade <= lo) return R[String(lo)];      // sem extrapolar para mais novo do que existe
  if (idade <= 0) return R["0"];
  if (idade <= 14) {
    const lo = Math.floor(idade), hi = Math.ceil(idade);
    if (lo === hi) return R[String(lo)];
    const w = idade - lo;
    return R[String(lo)]*(1-w) + R[String(hi)]*w;
  }
  return R["14"] * Math.pow(1 - f.tcauda, idade - 14);
}
function energiaCusto(f){
  if (f.energia === "eletrico") return (S.km/100) * f.kwh100 * S.kwh;
  const preco = f.energia === "diesel" ? S.comb * 0.95 : S.comb;   // diesel roda perto de 95% da gasolina
  return (S.km / f.kml) * preco;
}
const ENERGIA_NOME = {flex:"Flex", hibrido:"Híbrido", eletrico:"Elétrico", diesel:"Diesel"};
function equipScore(seg, ano){
  const base = {"Hatch compacto":3.0,"Sedan compacto":3.5,"SUV compacto":4.0,
                "Monovolume 7L":3.5,"Sedan medio":4.5,"SUV medio":5.0,
                "Compacto":3.2,"Medio":4.3,"SUV":4.4,"Picape":4.0,
                "Grande":5.0,"Premium":5.0}[seg] || 3.5;
  const era = ano >= 2023 ? 1.0 : (ano >= 2020 ? 0.5 : 0.0);
  return Math.min(5, base*0.8 + era*1.2);
}
function tco(f, ano, H){
  H = H || S.H;
  const p = f.serie[String(ano)]; if (!p) return null;
  const P = p.m, idade = Math.max(0, D.anoRef - ano);
  const r0 = relIdade(f, idade), rH = relIdade(f, idade + H);
  const revenda = P * (rH / r0);
  const deprec = (P - revenda) / H;
  let soma = 0, mn = 0;
  const kmf = Math.pow(S.km/12000, 0.7), msg = D.multSeg[f.segmento] || 1;
  for (let k = 0; k < H; k++){
    const a = idade + k;
    soma += P * (relIdade(f, a) / r0);
    let b = f.manutBase * multIdade(a) * msg * kmf * S.mmult;
    if (a < f.garantiaAnos) b *= 0.55;
    if (f.energia === "eletrico"){
      // provisao de bateria: o pacote custa uma fatia grande do carro e o risco sobe com a idade
      const vAno = P * (relIdade(f, a) / r0);
      b += vAno * S.bat * (a >= 8 ? 2 : 1);
    }
    mn += b;
  }
  const vmed = soma / H;
  const ipva = vmed * S.ipva, seguro = vmed * f.seguroPct, manut = mn / H;
  const combu = energiaCusto(f);
  const juros = jurosPorAno(P);
  const total = deprec + ipva + seguro + manut + combu + juros;
  return { fam:f.nome, marca:f.marca, seg:f.segmento, ano, idade, preco:P,
    lo:p.lo, hi:p.hi, nv:p.n, revenda, deprec, ipva, seguro, manut, comb:combu, juros, total,
    depPct: 100*(P-revenda)/P, garMeses: Math.max(0, f.garantiaAnos*12 - idade*12),
    garAnos:f.garantiaAnos, cambio:f.cambio, risco:f.risco, liq:f.liq,
    equip: equipScore(f.segmento, ano), custoKm: total/S.km,
    energia:f.energia, curto:f.curto, segEst:f.segEst, curada:f.curada, curvaEst:f.curvaEst,
    kml:f.kml, kwh100:f.kwh100, nVersoes:f.nVersoes, _f:f };
}
/* candidatos = todas as combinações família x ano dentro do orçamento e filtros */
function candidatos(ignoreBudget){
  const out = [];
  const alvo = norm(S.busca);
  if (alvo) ignoreBudget = true;         // buscou pelo nome: mostra o carro mesmo fora do orçamento
  for (const f of D.familias){
    if (alvo && !norm(f.nome).includes(alvo) && !norm(f.marca).includes(alvo)) continue;
    if (S.segs.size && !S.segs.has(f.segmento)) continue;
    if (S.marcas.size && !S.marcas.has(f.marca)) continue;
    if (S.ene !== "todas" && f.energia !== S.ene) continue;
    for (const ano in f.serie){
      const a = +ano;
      if (a > D.anoRef) continue;                 // sem "ano seguinte" (0 km)
      const c = tco(f, a); if (!c) continue;
      if (!ignoreBudget && (c.preco < S.budMin || c.preco > S.budMax)) continue;
      if (c.idade < S.idadeMin || c.idade > S.idadeMax) continue;
      if (c.total > S.tetoCusto) continue;
      if (S.soGarantia  && c.garMeses <= 0) continue;
      if (S.soConfiavel && (c.curvaEst || c.curto)) continue;
      if (S.soLiquido   && c.liq < 4) continue;
      if (S.soCambio    && c.risco > 2) continue;
      out.push(c);
    }
  }
  return out;
}
/* score 0-100 normalizado dentro do conjunto vigente */
function pontuar(cs){
  if (!cs.length) return cs;
  const dims = {
    custo: c => -c.total, manut: c => -c.manut, gar: c => c.garMeses,
    conf: c => c.equip,   liq: c => c.liq,      camb: c => 6 - c.risco
  };
  const rng = {};
  for (const k in dims){
    const v = cs.map(dims[k]); rng[k] = [Math.min(...v), Math.max(...v)];
  }
  const wsum = Object.values(S.w).reduce((a,b)=>a+b,0);
  for (const c of cs){
    let s = 0; c.dim = {};
    for (const k in dims){
      const [mn,mx] = rng[k];
      const n = mx > mn ? (dims[k](c) - mn) / (mx - mn) * 100 : 60;
      c.dim[k] = n; s += n * S.w[k];
    }
    c.score = s / wsum;
  }
  return cs;
}
