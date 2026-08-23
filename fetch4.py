import sys,json,re,threading,time
from concurrent.futures import ThreadPoolExecutor, as_completed
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor
from families import FAMILIES

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
MINY=2016
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))

t0=time.time()
# fase 1: trims de cada familia
fam_trims={}
for fam,mc,marca,seg,inc,exc in FAMILIES:
    ms=modelos(mc)
    fam_trims[fam]=[m for m in ms if re.search(inc,m['Label'],re.I) and AUTO.search(m['Label'])
                    and not MEC.search(m['Label']) and not (exc and re.search(exc,m['Label'],re.I))]
print("fase1 trims:", sum(len(v) for v in fam_trims.values()), f"({time.time()-t0:.0f}s)", flush=True)

# fase 2: anos de cada trim (paralelo)
jobs=[]
tasks=[(fam,mc,t) for fam,mc,marca,seg,inc,exc in FAMILIES for t in fam_trims[fam]]
n=[0]; lk=threading.Lock()
def get_anos(a):
    fam,mc,t=a
    ys=anos(mc,t['Value'])
    with lk:
        n[0]+=1
        if n[0]%60==0: print(f"  anos {n[0]}/{len(tasks)} ({time.time()-t0:.0f}s)",flush=True)
    return fam,mc,t,ys
with ThreadPoolExecutor(max_workers=4) as ex:
    for fam,mc,t,ys in ex.map(get_anos,tasks):
        for y in (ys or []):
            am=y['Value'].split('-')[0]
            if am.isdigit() and MINY<=int(am)<=2027: jobs.append((fam,mc,t,y['Value'],int(am)))
print("fase2 precos a buscar:", len(jobs), f"({time.time()-t0:.0f}s)", flush=True)

# fase 3: precos (paralelo)
res={f:[] for f in fam_trims}
m=[0]
def get_val(j):
    fam,mc,t,code,am=j
    v=valor(mc,t['Value'],code)
    with lk:
        m[0]+=1
        if m[0]%150==0: print(f"  precos {m[0]}/{len(jobs)} ({time.time()-t0:.0f}s)",flush=True)
    return fam,t,am,v
with ThreadPoolExecutor(max_workers=4) as ex:
    for fam,t,am,v in ex.map(get_val,jobs):
        if v and 'Valor' in v:
            res[fam].append({"trim":t['Label'].strip(),"trimCod":t['Value'],"ano":am,
                             "comb":v.get("Combustivel"),"valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")})

out=[{"familia":fam,"marca":marca,"segmento":seg,"marcaCod":mc,
      "nTrims":len(fam_trims[fam]),"registros":res[fam]}
     for fam,mc,marca,seg,inc,exc in FAMILIES]
json.dump(out,open("fipe_raw.json","w"),ensure_ascii=False)
print("\nTOTAL pontos:", sum(len(o['registros']) for o in out), f"({time.time()-t0:.0f}s)")
for o in out:
    ys=sorted({r['ano'] for r in o['registros']})
    print(f"  {o['familia']:24s} {o['nTrims']:3d} vers {len(o['registros']):4d} pts  {ys[0] if ys else '-'}..{ys[-1] if ys else '-'}")
