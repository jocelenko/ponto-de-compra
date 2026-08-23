/* ============ preenche cabecalho e metodologia ============ */
(function(){
  const set = (id,v) => { const e=document.getElementById(id); if(e) e.textContent=v; };
  set("hRef", D.mesRef); set("hFam", D.familias.length); set("hVer", D.nVersoes);
  set("hMarcas", D.nMarcas);
  set("hPts", D.nPontos.toLocaleString("pt-BR"));
  set("hTab", D.tabelaFipe + " (" + D.mesRef + ")");
  set("mRef", D.tabelaFipe + ", " + D.mesRef); set("fRef", D.mesRef);
  // idade do dado: esta e uma ferramenta viva, entao o mes de referencia e status, nao rodape
  const MESES = ["janeiro","fevereiro","março","abril","maio","junho",
                 "julho","agosto","setembro","outubro","novembro","dezembro"];
  const [mNome, mAno] = D.mesRef.split("/");
  const mi = MESES.indexOf(mNome.trim().toLowerCase());
  const el = document.getElementById("hIdade");
  if (el && mi >= 0){
    const ref = new Date(+mAno, mi, 1), hoje = new Date();
    const n = Math.max(0, (hoje.getFullYear()-ref.getFullYear())*12 + (hoje.getMonth()-ref.getMonth()));
    const velho = n >= 3;
    el.className = "idade" + (velho ? " velho" : "");
    el.innerHTML = `<span class="pt"></span>Preços de <b>${D.mesRef}</b>` +
      (n === 0 ? ", a tabela mais recente"
               : `, ou seja ${n} ${n===1?"mês":"meses"} atrás` + (velho ? ". Vale recoletar." : ""));
  }
})();
