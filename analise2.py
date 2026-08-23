# -*- coding: utf-8 -*-
"""Serie de preco por familia/ano, limpa de vies de mix de versao.
Metodo: indice encadeado matched-model (so versoes presentes em dois anos consecutivos),
ancorado no ano com mais versoes listadas."""
import json, statistics as st, collections
from families import FAMILIES
import custos as C

ANO_REF = 2026
raw  = json.load(open("fipe_raw.json"))
meta = {f[0]: dict(marca=f[2], segmento=f[3]) for f in FAMILIES}
med  = lambda xs: st.median(xs) if xs else None

# ---- 1. bruto por familia/ano (exclui ano modelo futuro, que e 0 km)
base = {}
for r in raw:
    regs = [x for x in r["registros"] if x["ano"] <= ANO_REF]
    if not regs: continue
    porano, portrim = collections.defaultdict(list), collections.defaultdict(dict)
    for x in regs:
        porano[x["ano"]].append(x["valor"]); portrim[x["trimCod"]][x["ano"]] = x["valor"]
    base[r["familia"]] = dict(porano=dict(porano), portrim=dict(portrim),
                              nTrims=r["nTrims"], nPontos=len(regs), **meta[r["familia"]])

# ---- 2. razao casada por transicao de ano, e fallback de mercado por idade
razao, mercado = {}, collections.defaultdict(list)
for fam, b in base.items():
    rz = {}
    for y in sorted(b["porano"]):
        rs = [t[y]/t[y+1] for t in b["portrim"].values()
              if y in t and (y+1) in t and t[y+1] and 0.60 < t[y]/t[y+1] < 1.05]
        if len(rs) >= 1:
            rz[y] = min(0.995, max(0.78, med(rs)))
            mercado[ANO_REF-(y+1)].append(rz[y])
    razao[fam] = rz
merc_idade = {a: med(v) for a, v in mercado.items()}
merc_geral = med([v for vs in mercado.values() for v in vs])

# ---- 3. serie ajustada: ancora no ano com mais versoes, propaga pelas razoes
fams = {}
for fam, b in base.items():
    anos = sorted(b["porano"])
    anc = max(anos, key=lambda a: (len(b["porano"][a]), a))
    P = {anc: med(b["porano"][anc])}
    def rho(y):   # P(y)/P(y+1), y mais velho que y+1
        return razao[fam].get(y) or merc_idade.get(ANO_REF-(y+1)) or merc_geral
    def span(y0, y1):                        # razao composta de y1 (novo) p/ y0 (velho)
        r = 1.0
        for y in range(y0, y1): r *= rho(y)
        return r
    i = anos.index(anc)
    for j in range(i-1, -1, -1):             # anos mais velhos que a ancora
        P[anos[j]] = P[anos[j+1]] * span(anos[j], anos[j+1])
    for j in range(i+1, len(anos)):          # anos mais novos que a ancora
        P[anos[j]] = P[anos[j-1]] / span(anos[j-1], anos[j])
    serie = {}
    for a in anos:
        v = sorted(b["porano"][a])
        fator = P[a]/med(v)                      # reescala a faixa junto com a mediana
        serie[a] = dict(mediana=P[a], min=v[0]*fator, max=v[-1]*fator,
                        n=len(v), bruto=med(v), ancora=(a == anc))
    fams[fam] = dict(familia=fam, marca=b["marca"], segmento=b["segmento"], serie=serie,
                     nTrims=b["nTrims"], nPontos=b["nPontos"], ancora=anc)

# ---- 4. curva de retencao por idade + taxa da cauda
def build(f):
    s = f["serie"]
    pts = sorted(((ANO_REF-a, s[a]["mediana"]) for a in s), key=lambda p: p[0])
    b0 = pts[0][1]
    f["_R"] = {i: v/b0 for i, v in pts}
    f["_pts"] = pts
    tail = pts[-5:] if len(pts) >= 5 else pts
    if len(tail) >= 2 and tail[-1][0] > tail[0][0]:
        t = 1-(tail[-1][1]/tail[0][1])**(1/(tail[-1][0]-tail[0][0]))
    else: t = 0.055
    f["_tcauda"] = min(0.13, max(0.03, t))
for f in fams.values(): build(f)

def valor_idade(f, idade):
    R = f["_R"]; ids = sorted(R)
    if idade in R: return R[idade]
    if idade < ids[0]:  return R[ids[0]]*(1-f["_tcauda"])**(idade-ids[0])
    if idade > ids[-1]: return R[ids[-1]]*(1-f["_tcauda"])**(idade-ids[-1])
    lo = max(i for i in ids if i < idade); hi = min(i for i in ids if i > idade)
    w = (idade-lo)/(hi-lo); return R[lo]*(1-w)+R[hi]*w
