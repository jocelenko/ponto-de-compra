import sys,json,re,threading,time,os
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor as valor_oficial
from fipe_par import valor_par, em_cache

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
ENE =re.compile(r'el[eé]trico|h[ií]brid',re.I)
MINY,MAXY=2016,2027
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))
t0=time.time(); lk=threading.Lock()

marcas=json.load(open('marcas.json'))
trims=[]
for m in marcas:
    mc=int(m['Value'])
    for x in modelos(mc):
        L=x['Label']
        if MEC.search(L) or not (AUTO.search(L) or ENE.search(L)): continue
        trims.append((m['Label'], mc, x['Value'], L.strip()))
print(f"versoes: {len(trims)} ({time.time()-t0:.0f}s)",flush=True)

jobs=[]
for a in trims:
    marca,mc,mo,lab=a
    for y in (anos(mc,mo) or []):
        am=y['Value'].split('-')[0]
        if am.isdigit() and MINY<=int(am)<=MAXY: jobs.append((a,y['Value'],int(am)))
pend=[j for j in jobs if not em_cache(j[0][1], j[0][2], j[1])]
print(f"jobs totais: {len(jobs)} | ja em cache: {len(jobs)-len(pend)} | pendentes: {len(pend)} ({time.time()-t0:.0f}s)",flush=True)

c=[0]; via=[0,0]
def gv(j):
    (marca,mc,mo,lab),code,am=j
    v=valor_par(mc,mo,code)
    src=1
    if not v:
        v=valor_oficial(mc,mo,code); src=2
    with lk:
        c[0]+=1
        if v: via[src-1]+=1
        if c[0]%150==0:
            print(f"  {c[0]}/{len(pend)} (par {via[0]} / ofic {via[1]}) {time.time()-t0:.0f}s",flush=True)
    return (marca,mc,mo,lab,am,v)

novos=[]
with ThreadPoolExecutor(max_workers=5) as ex:
    for marca,mc,mo,lab,am,v in ex.map(gv,pend):
        if v and 'Valor' in v:
            novos.append({"marca":marca,"marcaCod":mc,"trimCod":mo,"trim":lab,"ano":am,
                          "comb":v.get("Combustivel"),"valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")})
print(f"novos: {len(novos)} (parallelum {via[0]}, oficial {via[1]}) {time.time()-t0:.0f}s",flush=True)

# reconstroi fipe_all.json completo a partir do cache
base=json.load(open('fipe_all.json'))
vistos={(r["trimCod"],r["ano"]) for r in base}
base += [r for r in novos if (r["trimCod"],r["ano"]) not in vistos]
json.dump(base,open('fipe_all.json','w'),ensure_ascii=False)
print(f"TOTAL pontos: {len(base)} | marcas: {len({r['marca'] for r in base})}")
