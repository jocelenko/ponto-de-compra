import sys,json,re,threading
from concurrent.futures import ThreadPoolExecutor, as_completed
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor
from families import FAMILIES

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))
plock=threading.Lock(); done=[0]

def do_family(spec):
    fam,mc,marca,seg,inc,exc = spec
    ms=modelos(mc)
    trims=[m for m in ms if re.search(inc,m['Label'],re.I) and AUTO.search(m['Label'])
           and not MEC.search(m['Label']) and not (exc and re.search(exc,m['Label'],re.I))]
    jobs=[]
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs={ex.submit(anos,mc,t['Value']):t for t in trims}
        for f in as_completed(futs):
            t=futs[f]
            for y in (f.result() or []):
                am=y['Value'].split('-')[0]
                if am.isdigit() and 2013<=int(am)<=2027: jobs.append((t,y['Value'],int(am)))
    recs=[]
    with ThreadPoolExecutor(max_workers=10) as ex:
        futs={ex.submit(valor,mc,t['Value'],code):(t,am) for t,code,am in jobs}
        for f in as_completed(futs):
            t,am=futs[f]; v=f.result()
            if v and 'Valor' in v:
                recs.append({"trim":t['Label'].strip(),"trimCod":t['Value'],"ano":am,
                             "comb":v.get("Combustivel"),"valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")})
    with plock:
        done[0]+=1
        yrs=sorted({r['ano'] for r in recs})
        print(f"[{done[0]}/{len(FAMILIES)}] {fam}: {len(trims)} versoes, {len(recs)} pts, {yrs[0] if yrs else '-'}..{yrs[-1] if yrs else '-'}",flush=True)
    return {"familia":fam,"marca":marca,"segmento":seg,"marcaCod":mc,"nTrims":len(trims),"registros":recs}

out=[]
with ThreadPoolExecutor(max_workers=4) as ex:
    for r in ex.map(do_family, FAMILIES): out.append(r)
json.dump(out,open("fipe_raw.json","w"),ensure_ascii=False)
print("\nTOTAL pontos:", sum(len(o['registros']) for o in out))
