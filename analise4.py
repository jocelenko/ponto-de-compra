# -*- coding: utf-8 -*-
"""Pipeline completo: todas as versoes automaticas da FIPE.
Agrupa em familia x energia, monta serie por indice encadeado, deriva curva de retencao."""
import json, statistics as st, collections, re, sys
sys.path.insert(0,'.')
from derive import familia
import custos3 as C

ANO_REF = 2026
med = lambda xs: st.median(xs) if xs else None

def carregar():
    recs = json.load(open("fipe_all.json"))
    grupos = collections.defaultdict(list)
    meta = {}
    for r in recs:
        if r["ano"] > ANO_REF: continue          # ano modelo futuro = 0 km
        nome, marca, seg, ene, curada = familia(r["marca"], r["marcaCod"], r["trim"])
        grupos[nome].append(r)
        if nome not in meta:
            meta[nome] = dict(marca=marca, segCurado=seg, energia=ene, curada=curada,
                              exemplo=r["trim"])
    return grupos, meta

def construir(grupos, meta, min_anos=1, min_pts=1):
    # razoes de mercado por idade, para preencher lacunas
    razao_fam, mercado = {}, collections.defaultdict(list)
    porano_fam, portrim_fam = {}, {}
    for nome, recs in grupos.items():
        porano, portrim = collections.defaultdict(list), collections.defaultdict(dict)
        for x in recs:
            porano[x["ano"]].append(x["valor"]); portrim[x["trimCod"]][x["ano"]] = x["valor"]
        porano_fam[nome], portrim_fam[nome] = dict(porano), dict(portrim)
        rz = {}
        for y in sorted(porano):
            rs = [t[y]/t[y+1] for t in portrim.values()
                  if y in t and (y+1) in t and t[y+1] and 0.60 < t[y]/t[y+1] < 1.05]
            if rs:
                rz[y] = min(0.995, max(0.78, med(rs))); mercado[ANO_REF-(y+1)].append(rz[y])
        razao_fam[nome] = rz
    merc_idade = {a: med(v) for a, v in mercado.items()}
    merc_geral = med([v for vs in mercado.values() for v in vs]) or 0.945

    fams = {}
    for nome, recs in grupos.items():
        porano = porano_fam[nome]; anos = sorted(porano)
        if len(anos) < min_anos or len(recs) < min_pts: continue
        rz = razao_fam[nome]
        def rho(y): return rz.get(y) or merc_idade.get(ANO_REF-(y+1)) or merc_geral
        def span(y0, y1):
            r = 1.0
            for y in range(y0, y1): r *= rho(y)
            return r
        anc = max(anos, key=lambda a: (len(porano[a]), a))
        P = {anc: med(porano[anc])}
        i = anos.index(anc)
        for j in range(i-1, -1, -1): P[anos[j]] = P[anos[j+1]] * span(anos[j], anos[j+1])
        for j in range(i+1, len(anos)): P[anos[j]] = P[anos[j-1]] / span(anos[j-1], anos[j])
        serie = {}
        for a in anos:
            v = sorted(porano[a]); f = P[a]/med(v)
            serie[a] = dict(mediana=P[a], min=v[0]*f, max=v[-1]*f, n=len(v), bruto=med(v))
        m = meta[nome]
        seg = m["segCurado"] or C.inferir_segmento(nome, m["exemplo"], P[max(anos)])
        pts = sorted(((ANO_REF-a, serie[a]["mediana"]) for a in anos), key=lambda p: p[0])
        b0 = pts[0][1]
        R = {i_: v/b0 for i_, v in pts}
        tail = pts[-5:] if len(pts) >= 5 else pts
        if len(tail) >= 2 and tail[-1][0] > tail[0][0] and tail[0][1] > 0:
            t = 1-(tail[-1][1]/tail[0][1])**(1/(tail[-1][0]-tail[0][0]))
        else: t = 1-merc_geral
        fams[nome] = dict(nome=nome, marca=m["marca"], segmento=seg, energia=m["energia"],
            curada=m["curada"], segInferido=(m["segCurado"] is None), exemplo=m["exemplo"],
            serie=serie, R=R, tcauda=min(0.13, max(0.03, t)), anc=anc,
            nTrims=len({x["trimCod"] for x in recs}), nPontos=len(recs), anos=anos)
    # familias com um unico ano modelo nao tem curva propria: usa a mediana do mercado
    curvas = [f["R"] for f in fams.values() if len(f["anos"]) >= 4]
    mercR = {}
    for i in range(0, 15):
        vs = sorted(c[i] for c in curvas if i in c)
        if vs: mercR[i] = vs[len(vs)//2]
    for i in range(0, 15):                      # preenche buracos por decaimento medio
        if i not in mercR:
            base = max((k for k in mercR if k < i), default=None)
            mercR[i] = (mercR[base] * merc_geral**(i-base)) if base is not None else 1.0
    for f in fams.values():
        f["curvaEst"] = 0
        if len(f["anos"]) >= 2: continue
        a0 = ANO_REF - f["anos"][0]
        base = mercR.get(a0, mercR[14])
        f["R"] = {a0: 1.0}
        f["tcauda"] = 1 - merc_geral
        f["_mercR"] = {i: mercR[i]/base for i in range(0, 15)}
        f["curvaEst"] = 1
    return fams, merc_geral

def valor_idade(f, idade):
    if f.get("curvaEst") and "_mercR" in f:
        m = f["_mercR"]
        return m.get(idade, m[14]*(1-f["tcauda"])**(idade-14))
    R = f["R"]; ids = sorted(R)
    if idade in R: return R[idade]
    if idade < ids[0]:  return R[ids[0]]*(1-f["tcauda"])**(idade-ids[0])
    if idade > ids[-1]: return R[ids[-1]]*(1-f["tcauda"])**(idade-ids[-1])
    lo = max(i for i in ids if i < idade); hi = min(i for i in ids if i > idade)
    w = (idade-lo)/(hi-lo); return R[lo]*(1-w)+R[hi]*w
