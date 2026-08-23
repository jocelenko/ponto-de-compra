import sys, json, re
sys.path.insert(0,'.')
from fipe import anos, valor
from basket import BASKET

def money(s):
    return float(re.sub(r'[^\d,]','',s).replace('.','').replace(',','.'))

out=[]
for i,(mc, mo, nome, marca, seg, cambio) in enumerate(BASKET, 1):
    ys = anos(mc, mo)
    if not ys:
        print(f"[{i}/{len(BASKET)}] {marca} {nome}: SEM ANOS"); continue
    rows=[]
    for y in ys:
        code = y['Value']            # ex "2020-1"
        am = code.split('-')[0]
        if am in ('32000','zero'): continue
        try: am_i=int(am)
        except: continue
        if am_i < 2012: continue
        v = valor(mc, mo, code)
        if not v or 'Valor' not in v: continue
        rows.append({"anoModelo": am_i, "combustivel": v.get("Combustivel"),
                     "valor": money(v["Valor"]), "codigoFipe": v.get("CodigoFipe"),
                     "mesRef": v.get("MesReferencia","").strip()})
    rows.sort(key=lambda r: -r["anoModelo"])
    out.append({"marca":marca,"nome":nome,"segmento":seg,"cambio":cambio,
                "marcaCod":mc,"modeloCod":mo,"series":rows})
    print(f"[{i}/{len(BASKET)}] {marca} {nome}: {len(rows)} anos  {rows[0]['anoModelo'] if rows else '-'}..{rows[-1]['anoModelo'] if rows else '-'}", flush=True)

json.dump(out, open("fipe_series.json","w"), ensure_ascii=False, indent=1)
print("\nOK ->", sum(len(o['series']) for o in out), "pontos de preco")
