import sys, json, re
sys.path.insert(0,'.')
from fipe import modelos, anos, valor
from families import FAMILIES

AUTO = re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.', re.I)
MEC  = re.compile(r'\bmec\.?\b|manual', re.I)
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))

MINYEAR = 2013
out = []
for fi,(fam, mc, marca, seg, inc, exc) in enumerate(FAMILIES,1):
    ms = modelos(mc)
    trims = [m for m in ms if re.search(inc, m['Label'], re.I)
             and AUTO.search(m['Label']) and not MEC.search(m['Label'])
             and not (exc and re.search(exc, m['Label'], re.I))]
    recs = []
    for t in trims:
        ys = anos(mc, t['Value'])
        if not ys: continue
        for y in ys:
            code = y['Value']; am = code.split('-')[0]
            if not am.isdigit(): continue
            am_i = int(am)
            if am_i < MINYEAR or am_i > 2027: continue
            v = valor(mc, t['Value'], code)
            if not v or 'Valor' not in v: continue
            recs.append({"trim": t['Label'].strip(), "trimCod": t['Value'],
                         "ano": am_i, "comb": v.get("Combustivel"),
                         "valor": money(v["Valor"]), "fipe": v.get("CodigoFipe")})
    out.append({"familia":fam,"marca":marca,"segmento":seg,"marcaCod":mc,
                "nTrims":len(trims),"registros":recs})
    yrs = sorted({r['ano'] for r in recs})
    print(f"[{fi}/{len(FAMILIES)}] {fam}: {len(trims)} versoes, {len(recs)} pontos, anos {yrs[0] if yrs else '-'}..{yrs[-1] if yrs else '-'}", flush=True)
    json.dump(out, open("fipe_raw.json","w"), ensure_ascii=False)

print("\nTOTAL pontos:", sum(len(o['registros']) for o in out))
