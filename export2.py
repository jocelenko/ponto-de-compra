# -*- coding: utf-8 -*-
import json, statistics as st, sys
sys.path.insert(0,'.')
exec(open("analise2.py").read())
import custos as C

out = {"anoRef": ANO_REF, "mesRef": "agosto/2026", "tabelaFipe": 336,
       "multIdade": [[3,1.0],[5,1.6],[7,2.2],[9,3.0],[99,3.8]],
       "multSeg": C.MULT_SEG, "familias": []}
tot_ver = 0
for fam, f in sorted(fams.items()):
    p = C.FAM.get(fam, dict(kml=11.0, seg=0.043, risco=2, liq=3, cambio="?"))
    serie = {str(a): dict(m=round(v["mediana"]), lo=round(v["min"]), hi=round(v["max"]),
                          n=v["n"], br=round(v["bruto"]))
             for a, v in sorted(f["serie"].items())}
    R = {str(i): round(valor_idade(f, i), 5) for i in range(0, 15)}
    tot_ver += f["nTrims"]
    out["familias"].append(dict(
        nome=fam, marca=f["marca"], segmento=f["segmento"], cambio=p["cambio"],
        risco=p["risco"], liq=p["liq"], kml=p["kml"], seguroPct=p["seg"],
        garantiaAnos=C.GARANTIA.get(f["marca"], 3), manutBase=C.MANUT_BASE.get(f["marca"], 1600),
        nVersoes=f["nTrims"], nPontos=f["nPontos"], tcauda=round(f["_tcauda"], 4),
        ancora=f["ancora"], serie=serie, retencao=R))
out["nVersoes"] = tot_ver
out["nPontos"]  = sum(x["nPontos"] for x in out["familias"])
json.dump(out, open("dados.json","w"), ensure_ascii=False, separators=(",",":"))
print("familias:", len(out["familias"]), "| versoes:", tot_ver, "| pontos:", out["nPontos"],
      "| bytes:", len(open("dados.json").read()))
