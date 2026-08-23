import sys,json,re,threading,time
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fipe_mt import modelos, anos, valor
from families_cn import FAM_CN

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
ENE =re.compile(r'el[eé]trico',re.I); HIB=re.compile(r'h[ií]brid',re.I)
MINY=2016
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))
t0=time.time(); lk=threading.Lock()

trims=[]
for nome,cods,marca,seg,inc,exc,force in FAM_CN:
    for mc in cods:
        for m in modelos(mc):
            L=m['Label']
            if not re.search(inc,L,re.I): continue
            if exc and re.search(exc,L,re.I): continue
            if MEC.search(L): continue
            if not (force or AUTO.search(L) or ENE.search(L) or HIB.search(L)): continue
            trims.append((nome,mc,m))
print("trims:",len(trims), f"({time.time()-t0:.0f}s)",flush=True)

jobs=[]
def ga(a):
    nome,mc,t=a; return nome,mc,t,anos(mc,t['Value'])
with ThreadPoolExecutor(max_workers=4) as ex:
    for nome,mc,t,ys in ex.map(ga,trims):
        for y in (ys or []):
            am=y['Value'].split('-')[0]
            if am.isdigit() and MINY<=int(am)<=2027: jobs.append((nome,mc,t,y['Value'],int(am)))
print("precos a buscar:",len(jobs), f"({time.time()-t0:.0f}s)",flush=True)

res={n[0]:[] for n in FAM_CN}; c=[0]
def gv(j):
    nome,mc,t,code,am=j; v=valor(mc,t['Value'],code)
    with lk:
        c[0]+=1
        if c[0]%100==0: print(f"  {c[0]}/{len(jobs)} ({time.time()-t0:.0f}s)",flush=True)
    return nome,t,am,v
with ThreadPoolExecutor(max_workers=4) as ex:
    for nome,t,am,v in ex.map(gv,jobs):
        if v and 'Valor' in v:
            res[nome].append({"trim":t['Label'].strip(),"trimCod":t['Value'],"ano":am,
                              "comb":v.get("Combustivel"),"valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")})
out=[{"familia":n,"marca":mk,"segmento":sg,"marcaCod":cd[0],
      "nTrims":len({r['trimCod'] for r in res[n]}),"registros":res[n]}
     for n,cd,mk,sg,inc,exc,f in FAM_CN]
json.dump(out,open("fipe_raw_cn.json","w"),ensure_ascii=False)
print("\nTOTAL:",sum(len(o['registros']) for o in out), f"({time.time()-t0:.0f}s)")
for o in out:
    ys=sorted({r['ano'] for r in o['registros']})
    print(f"  {o['familia']:24s} {o['nTrims']:2d} vers {len(o['registros']):3d} pts  {ys[0] if ys else '-'}..{ys[-1] if ys else '-'}")
