"""Reconstroi fipe_all.json lendo TUDO que ja esta no cache, em vez de depender
do que cada execucao conseguiu gravar antes de morrer."""
import sys,json,re,os
sys.path.insert(0,'.')
from fipe_mt import modelos, anos
from fipe_par import chave

AUTO=re.compile(r'\b(aut|cvt|automatico|autom|at6|dct|tiptronic|dsg)\b|aut\.',re.I)
MEC =re.compile(r'\bmec\.?\b|manual',re.I)
ENE =re.compile(r'el[eé]trico|h[ií]brid',re.I)
MINY,MAXY=2016,2027
def money(s): return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))

marcas=json.load(open('marcas.json'))
out=[]; falta=[]; vazio=0
for m in marcas:
    mc=int(m['Value'])
    for x in modelos(mc):
        L=x['Label'].strip()
        if MEC.search(L) or not (AUTO.search(L) or ENE.search(L)): continue
        for y in (anos(mc,x['Value']) or []):
            code=y['Value']; am=code.split('-')[0]
            if not am.isdigit() or not (MINY<=int(am)<=MAXY): continue
            k=chave(mc,x['Value'],code)
            if not os.path.exists(k): falta.append((m['Label'],mc,x['Value'],code)); continue
            try: v=json.load(open(k))
            except: falta.append((m['Label'],mc,x['Value'],code)); continue
            if not isinstance(v,dict) or 'Valor' not in v: vazio+=1; continue
            out.append({"marca":m['Label'],"marcaCod":mc,"trimCod":x['Value'],"trim":L,
                        "ano":int(am),"comb":v.get("Combustivel"),
                        "valor":money(v["Valor"]),"fipe":v.get("CodigoFipe")})
json.dump(out,open('fipe_all.json','w'),ensure_ascii=False)
json.dump(falta,open('_falta.json','w'),ensure_ascii=False)
print(f"reconstruido: {len(out)} precos | marcas: {len({r['marca'] for r in out})}")
print(f"sem resposta em cache: {len(falta)} | cache com resposta vazia: {vazio}")
import collections
c=collections.Counter(f[0] for f in falta)
print("faltando por marca:", c.most_common(12))
