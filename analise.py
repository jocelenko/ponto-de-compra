# -*- coding: utf-8 -*-
import json, math, statistics as st
from families import FAMILIES
import custos as C

ANO_REF = 2026          # agosto/2026, tabela FIPE 336
raw = json.load(open("fipe_raw.json"))
meta = {f[0]: dict(marca=f[2], segmento=f[3]) for f in FAMILIES}

def med(xs): return st.median(xs) if xs else None

# ---------- 1. Serie de preco por familia/ano (mediana das versoes automaticas)
fams = {}
for r in raw:
    fam = r["familia"]; regs = r["registros"]
    if not regs: continue
    porano = {}
    for x in regs: porano.setdefault(x["ano"], []).append(x["valor"])
    serie = {}
    for ano, vs in porano.items():
        vs = sorted(vs)
        serie[ano] = dict(mediana=med(vs), min=vs[0], max=vs[-1], n=len(vs),
                          p25=vs[max(0,int(len(vs)*.25)-0)] if len(vs)>3 else vs[0],
                          p75=vs[min(len(vs)-1,int(len(vs)*.75))] if len(vs)>3 else vs[-1])
    # ---------- 2. indice encadeado matched-model (limpa vies de mix de versao)
    portrim = {}
    for x in regs: portrim.setdefault(x["trimCod"], {})[x["ano"]] = x["valor"]
    anos_ord = sorted(serie)
    reten = {}   # reten[y] = P(y)/P(y+1) medido em versoes presentes nos dois anos
    for y in anos_ord:
        rs = [t[y]/t[y+1] for t in portrim.values() if y in t and (y+1) in t and t[y+1]]
        if rs: reten[y] = med(rs)
    fams[fam] = dict(familia=fam, marca=meta[fam]["marca"], segmento=meta[fam]["segmento"],
                     serie=serie, reten=reten, nTrims=r["nTrims"], nPontos=len(regs))

# ---------- 3. Curva de retencao por idade, com extrapolacao da cauda
def curva_idade(f):
    """R[idade] = valor relativo. Usa mediana observada + encadeamento."""
    s = f["serie"]
    pts = sorted(((ANO_REF-a, s[a]["mediana"]) for a in s
                  if s[a]["mediana"] and a <= ANO_REF), key=lambda p: p[0])
    base = pts[0][1]
    return {i: v/base for i, v in pts}, pts

def taxa_cauda(pts):
    """taxa anual de queda estimada na cauda (ultimos ~4 pontos), 4%..14%"""
    tail = pts[-5:] if len(pts) >= 5 else pts
    if len(tail) < 2: return 0.08
    (a0,v0),(a1,v1) = tail[0], tail[-1]
    if a1 <= a0 or v1 <= 0 or v0 <= 0: return 0.08
    t = 1 - (v1/v0)**(1/(a1-a0))
    return min(0.14, max(0.04, t))

def valor_idade(f, idade):
    """valor relativo interpolado/extrapolado para qualquer idade"""
    R, pts = f["_R"], f["_pts"]
    if idade in R: return R[idade]
    ids = sorted(R)
    if idade < ids[0]:
        t = f["_tcauda"]
        return R[ids[0]] * (1-t)**(idade-ids[0])   # extrapola p/ mais novo
    if idade > ids[-1]:
        t = f["_tcauda"]
        return R[ids[-1]] * (1-t)**(idade-ids[-1])
    lo = max(i for i in ids if i < idade); hi = min(i for i in ids if i > idade)
    w = (idade-lo)/(hi-lo)
    return R[lo]*(1-w) + R[hi]*w

for f in fams.values():
    f["_R"], f["_pts"] = curva_idade(f)
    f["_tcauda"] = taxa_cauda(f["_pts"])
json.dump({"ok":True}, open("_analise_step1.json","w"))
print("familias com serie:", len(fams))
for k,v in sorted(fams.items()):
    ys=sorted(v["serie"]); 
    print(f"  {k:24s} {v['nPontos']:4d}pts anos {ys[0]}..{ys[-1]}  cauda {v['_tcauda']*100:.1f}%/ano")

# ---------- 4. TCO: custo anualizado de posse
def equip_score(seg, ano):
    base = {"Hatch compacto":3.0,"Sedan compacto":3.5,"SUV compacto":4.0,
            "Monovolume 7L":3.5,"Sedan medio":4.5,"SUV medio":5.0}.get(seg,3.5)
    era = 1.0 if ano>=2023 else (0.5 if ano>=2020 else 0.0)   # multimidia/ADAS de serie
    return min(5.0, base*0.8 + era*1.2)

def tco(f, ano, H, kmano=12000, ipva=0.04, precoComb=6.20, segFator=1.0):
    seg = f["segmento"]; marca = f["marca"]
    p = f["serie"].get(ano)
    if not p: return None
    P = p["mediana"]; idade = max(0, ANO_REF-ano)
    # revenda em H anos (R$ de hoje) via curva propria da familia
    rel_hoje = valor_idade(f, idade); rel_saida = valor_idade(f, idade+H)
    revenda = P * (rel_saida/rel_hoje)
    deprec = (P-revenda)/H
    # IPVA e seguro: media sobre o periodo, sobre valor decrescente
    vals = [P*(valor_idade(f, idade+k)/rel_hoje) for k in range(H)]
    vmed = sum(vals)/len(vals)
    ipva_a = vmed*ipva
    fam_p = C.FAM.get(f["familia"], dict(kml=11.0, seg=0.043, risco=2, liq=3, cambio="?"))
    seguro_a = vmed*fam_p["seg"]*segFator
    # manutencao: base marca x idade x segmento, media do periodo, garantia abate
    gar = C.GARANTIA.get(marca,3)
    mn = []
    for k in range(H):
        a = idade+k
        base = C.MANUT_BASE.get(marca,1600)*C.mult_idade(a)*C.MULT_SEG.get(seg,1.0)
        base *= (kmano/12000.0)**0.7
        if a < gar: base *= 0.55          # em garantia: so revisao, sem risco de peca
        mn.append(base)
    manut_a = sum(mn)/len(mn)
    comb_a = (kmano/fam_p["kml"])*precoComb
    total = deprec+ipva_a+seguro_a+manut_a+comb_a
    gar_rest = max(0, gar*12 - idade*12)
    return dict(familia=f["familia"], marca=marca, segmento=seg, ano=ano, idade=idade,
        preco=round(P), precoMin=round(p["min"]), precoMax=round(p["max"]), nVersoes=p["n"],
        revenda=round(revenda), deprec=round(deprec), ipva=round(ipva_a), seguro=round(seguro_a),
        manut=round(manut_a), comb=round(comb_a), total=round(total),
        depPct=round(100*(P-revenda)/P,1), garantiaMeses=gar_rest, garantiaAnos=gar,
        cambio=fam_p["cambio"], risco=fam_p["risco"], liq=fam_p["liq"], kml=fam_p["kml"],
        equip=round(equip_score(seg,ano),2), custoKm=round(total/kmano,3))

