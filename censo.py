import sys,json,re,threading
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0,'.')
from fipe_mt import modelos
AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
ENE =re.compile(r'el[eé]trico|h[ií]brid',re.I)
marcas=json.load(open('marcas.json'))
def go(m):
    ms=modelos(int(m['Value']))
    auto=[x for x in ms if (AUTO.search(x['Label']) or ENE.search(x['Label'])) and not MEC.search(x['Label'])]
    return m['Label'], int(m['Value']), len(ms), len(auto)
res=[]
with ThreadPoolExecutor(max_workers=4) as ex:
    for r in ex.map(go, marcas): res.append(r)
res.sort(key=lambda r:-r[3])
tot_m=sum(r[2] for r in res); tot_a=sum(r[3] for r in res)
print(f"marcas: {len(res)} | modelos totais: {tot_m} | versoes automaticas: {tot_a}\n")
for nome,cod,nm,na in res:
    if na: print(f"  {cod:>4} {nome:28s} {nm:>5} modelos  {na:>5} automaticos")
json.dump([{"nome":n,"cod":c,"modelos":m,"auto":a} for n,c,m,a in res], open("censo.json","w"), ensure_ascii=False)
