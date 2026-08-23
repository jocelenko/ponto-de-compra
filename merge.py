# -*- coding: utf-8 -*-
"""Une a varredura completa com as coletas curadas (que usaram filtro forceAuto
e por isso pegaram versoes sem 'Aut.' no nome, como Omoda, Ora e Dolphin Mini)."""
import json, os
MARCA_LABEL = {}
for m in json.load(open("marcas.json")): MARCA_LABEL[int(m["Value"])] = m["Label"]

def flat_curado(path, fam_field=True):
    if not os.path.exists(path): return []
    out = []
    for g in json.load(open(path)):
        mc = g["marcaCod"]
        for r in g["registros"]:
            out.append({"marca": MARCA_LABEL.get(mc, g["marca"]), "marcaCod": mc,
                        "trimCod": r["trimCod"], "trim": r["trim"], "ano": r["ano"],
                        "comb": r.get("comb"), "valor": r["valor"], "fipe": r.get("fipe"),
                        "famForcada": g["familia"] if fam_field else None})
    return out

def carregar_tudo():
    base = json.load(open("fipe_all.json")) if os.path.exists("fipe_all.json") else []
    for r in base: r.setdefault("famForcada", None)
    extra = flat_curado("fipe_raw_cn.json")
    vistos = {(r["trimCod"], r["ano"]) for r in base}
    add = [r for r in extra if (r["trimCod"], r["ano"]) not in vistos]
    # anexa famForcada nos registros ja presentes na varredura
    idx = {(r["trimCod"], r["ano"]): r for r in extra}
    for r in base:
        k = (r["trimCod"], r["ano"])
        if k in idx and idx[k]["famForcada"]: r["famForcada"] = idx[k]["famForcada"]
    return base + add
