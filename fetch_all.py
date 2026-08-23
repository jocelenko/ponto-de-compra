import sys,json,re,threading,time,os
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
ENE =re.compile(r'el[eé]trico|h[ií]brid',re.I)
MINY, MAXY = 2016, 2027
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))
t0=time.time(); lk=threading.Lock()

marcas=json.load(open('marcas.json'))
trims=[]
for m in marcas:
    mc=int(m['Value'])
    for x in modelos(mc):
        L=x['Label']
        if MEC.search(L): continue
        if not (AUTO.search(L) or ENE.search(L)): continue
        trims.append((m['Label'], mc, x['Value'], L.strip()))
print(f"FASE A: {len(trims)} versoes automaticas em {len(marcas)} marcas ({time.time()-t0:.0f}s)",flush=True)

# --- anos
n=[0]; jobs=[]
def ga(a):
    marca,mc,mo,lab=a; return a, anos(mc,mo)
with ThreadPoolExecutor(max_workers=4) as ex:
    for a,ys in ex.map(ga,trims):
        with lk:
            n[0]+=1
            if n[0]%200==0: print(f"  anos {n[0]}/{len(trims)} ({time.time()-t0:.0f}s)",flush=True)
        for y in (ys or []):
            am=y['Value'].split('-')[0]
            if am.isdigit() and MINY<=int(am)<=MAXY: jobs.append((a,y['Value'],int(am)))
print(f"FASE B: {len(jobs)} precos a buscar ({time.time()-t0:.0f}s)",flush=True)
json.dump(len(jobs),open("_alljobs.json","w"))

# --- precos
out=[]; c=[0]
def gv(j):
    (marca,mc,mo,lab),code,am=j
    v=valor(mc,mo,code)
    with lk:
        c[0]+=1
        if c[0]%100==0:
            print(f"  precos {c[0]}/{len(jobs)} ({time.time()-t0:.0f}s)",flush=True)
            json.dump(out,open("fipe_all.json","w"),ensure_ascii=False)
    if v and 'Valor' in v:
        return {"marca":marca,"marcaCod":mc,"trimCod":mo,"trim":lab,"ano":am,
                "comb":v.get("Combustivel"),"valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")}
with ThreadPoolExecutor(max_workers=2) as ex:
    for r in ex.map(gv,jobs):
        if r: out.append(r)
json.dump(out,open("fipe_all.json","w"),ensure_ascii=False)
print(f"\nTOTAL pontos: {len(out)} ({time.time()-t0:.0f}s)")
