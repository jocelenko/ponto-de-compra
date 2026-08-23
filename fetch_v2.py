"""Expande o universo: todos os cambios (automatico, manual, nao informado) e anos 2010+.
Parallelum primeiro, oficial como reserva. Tudo grava no cache2, entao e retomavel:
se morrer, rodar de novo pula o que ja esta em cache."""
import sys,json,re,threading,time
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor as valor_oficial
from fipe_par import valor_par, em_cache

MINY, MAXY = 2010, 2027
t0=time.time(); lk=threading.Lock()

marcas=json.load(open('marcas.json'))
trims=[]
for m in marcas:
    mc=int(m['Value'])
    for x in modelos(mc):
        trims.append((m['Label'], mc, x['Value'], x['Label'].strip()))
print(f"FASE A: {len(trims)} versoes em {len(marcas)} marcas ({time.time()-t0:.0f}s)", flush=True)

n=[0]; jobs=[]
def ga(a):
    marca,mc,mo,lab=a
    return a, anos(mc,mo)
with ThreadPoolExecutor(max_workers=4) as ex:
    for a,ys in ex.map(ga,trims):
        with lk:
            n[0]+=1
            if n[0]%300==0: print(f"  anos {n[0]}/{len(trims)} ({time.time()-t0:.0f}s)", flush=True)
        for y in (ys or []):
            am=y['Value'].split('-')[0]
            if am.isdigit() and MINY<=int(am)<=MAXY: jobs.append((a, y['Value'], int(am)))
print(f"FASE B: {len(jobs)} precos no universo ({time.time()-t0:.0f}s)", flush=True)

pend=[j for j in jobs if not em_cache(j[0][1], j[0][2], j[1])]
print(f"  ja em cache: {len(jobs)-len(pend)} | pendentes: {len(pend)}", flush=True)

c=[0]; via=[0,0]
def gv(j):
    (marca,mc,mo,lab),code,am = j
    v = valor_par(mc,mo,code); src=1
    if not v: v = valor_oficial(mc,mo,code); src=2
    with lk:
        c[0]+=1
        if v: via[src-1]+=1
        if c[0]%250==0:
            resta=(len(pend)-c[0])/max(0.01,c[0]/(time.time()-t0))
            print(f"  {c[0]}/{len(pend)} (par {via[0]} / ofic {via[1]}) "
                  f"{time.time()-t0:.0f}s, faltam ~{resta/3600:.1f}h", flush=True)
    return None
with ThreadPoolExecutor(max_workers=5) as ex:
    list(ex.map(gv, pend))
print(f"\nCOLETA COMPLETA: {c[0]} buscados (parallelum {via[0]}, oficial {via[1]}) em {time.time()-t0:.0f}s", flush=True)
