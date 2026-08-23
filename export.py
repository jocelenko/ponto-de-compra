# -*- coding: utf-8 -*-
"""Exporta os ingredientes p/ o dashboard recalcular TCO ao vivo em JS."""
import json, statistics as st
from families import FAMILIES
import custos as C
exec(open("analise.py").read().split("# ---------- 4.")[0])   # reaproveita etapas 1-3

out = {"anoRef": ANO_REF, "mesRef": "agosto/2026", "tabelaFipe": 336,
       "multIdade": [[3,1.0],[5,1.6],[7,2.2],[9,3.0],[99,3.8]],
       "multSeg": C.MULT_SEG, "manutBase": C.MANUT_BASE, "garantia": C.GARANTIA,
       "familias": []}

for fam, f in sorted(fams.items()):
    p = C.FAM.get(fam, dict(kml=11.0, seg=0.043, risco=2, liq=3, cambio="?"))
    serie = {str(a): dict(m=round(v["mediana"]), lo=round(v["min"]), hi=round(v["max"]), n=v["n"])
             for a, v in sorted(f["serie"].items())}
    # curva de retencao densa: idade 0..14
    R = {}
    for i in range(0, 15):
        R[str(i)] = round(valor_idade(f, i), 5)
    out["familias"].append(dict(
        nome=fam, marca=f["marca"], segmento=f["segmento"], cambio=p["cambio"],
        risco=p["risco"], liq=p["liq"], kml=p["kml"], seguroPct=p["seg"],
        garantiaAnos=C.GARANTIA.get(f["marca"], 3), manutBase=C.MANUT_BASE.get(f["marca"], 1600),
        nVersoes=f["nTrims"], nPontos=f["nPontos"], tcauda=round(f["_tcauda"], 4),
        serie=serie, retencao=R,
        idadeMin=min(ANO_REF-a for a in f["serie"]), idadeMax=max(ANO_REF-a for a in f["serie"])))

json.dump(out, open("dados.json", "w"), ensure_ascii=False, separators=(",", ":"))
print("familias exportadas:", len(out["familias"]))
print("bytes:", len(open("dados.json").read()))
# sanity: curva media de retencao do mercado
import collections
agg = collections.defaultdict(list)
for fx in out["familias"]:
    for i, v in fx["retencao"].items(): agg[int(i)].append(v)
print("\nRetencao mediana do mercado (base = carro 0 km da familia):")
for i in sorted(agg):
    if i <= 12: print(f"  {i:2d} anos: {st.median(agg[i])*100:5.1f}%")
