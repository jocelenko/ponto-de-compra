# -*- coding: utf-8 -*-
import json, sys, collections
sys.path.insert(0,'.')
from merge import carregar_tudo
from derive import familia, energia, SUF
import analise4 as A, custos3 as C
import families, families_cn

CUR_MK = {x[0]: (x[2], x[3]) for x in families.FAMILIES}
CUR_MK.update({x[0]: (x[2], x[3]) for x in families_cn.FAM_CN})

recs = carregar_tudo()
grupos, meta = collections.defaultdict(list), {}
for r in recs:
    if r["ano"] > A.ANO_REF: continue
    ff = r.get("famForcada")
    if ff:
        e = energia(r["trim"]); nome = ff + SUF[e]
        mk, sg = CUR_MK.get(ff, (r["marca"], None)); cur = True
    else:
        nome, mk, sg, e, cur = familia(r["marca"], r["marcaCod"], r["trim"])
    grupos[nome].append(r)
    if nome not in meta:
        meta[nome] = dict(marca=mk, segCurado=sg, energia=e, curada=cur, exemplo=r["trim"])

fams, merc = A.construir(grupos, meta)

out = {"anoRef": A.ANO_REF, "mesRef": "agosto/2026", "tabelaFipe": 336,
       "multIdade": [[3,1.0],[5,1.6],[7,2.2],[9,3.0],[99,3.8]],
       "multSeg": C.MULT_SEG, "familias": []}
tot_ver = tot_pts = 0
for nome, f in sorted(fams.items()):
    p = C.params(nome, f["marca"], f["segmento"], f["energia"])
    serie = {str(a): dict(m=round(v["mediana"]), lo=round(v["min"]), hi=round(v["max"]), n=v["n"])
             for a, v in sorted(f["serie"].items())}
    R = {str(i): round(A.valor_idade(f, i), 5) for i in range(0, 15)}
    tot_ver += f["nTrims"]; tot_pts += f["nPontos"]
    out["familias"].append(dict(
        nome=nome, marca=f["marca"], segmento=f["segmento"], energia=f["energia"],
        cambio=p["cambio"], risco=p["risco"], liq=p["liq"],
        kml=(round(p["kml"],1) if p["kml"] else None),
        kwh100=(round(p["kwh100"],1) if p["kwh100"] else None),
        seguroPct=round(p["seguro"],4), garantiaAnos=p["garantia"],
        manutBase=round(p["manutBase"]), nVersoes=f["nTrims"], nPontos=f["nPontos"],
        tcauda=round(f["tcauda"],4), curada=1 if f["curada"] else 0,
        segEst=1 if f["segInferido"] else 0,
        curto=1 if len(f["anos"]) < 4 else 0,
        curvaEst=f.get("curvaEst", 0),
        serie=serie, retencao=R))
out["nFamilias"] = len(out["familias"]); out["nVersoes"] = tot_ver; out["nPontos"] = tot_pts
out["nMarcas"] = len({x["marca"] for x in out["familias"]})
json.dump(out, open("dados.json","w"), ensure_ascii=False, separators=(",",":"))
kb = len(open("dados.json").read())/1024
print(f"familias: {out['nFamilias']} | marcas: {out['nMarcas']} | versoes: {tot_ver} | pontos: {tot_pts} | {kb:.0f} KB")
seg = collections.Counter(x["segmento"] for x in out["familias"])
ene = collections.Counter(x["energia"] for x in out["familias"])
print("segmentos:", dict(seg)); print("energia:", dict(ene))
print("curto historico:", sum(x["curto"] for x in out["familias"]),
      "| segmento estimado:", sum(x["segEst"] for x in out["familias"]))
