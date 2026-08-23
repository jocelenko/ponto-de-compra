"""Fonte alternativa: parallelum.com.br. Mesmos codigos de marca/modelo da FIPE oficial
e mesma forma de resposta, entao grava no MESMO cache da API oficial."""
import json, urllib.request, os, time, threading, hashlib
CACHE="cache2"; os.makedirs(CACHE, exist_ok=True)
REF=336
HP={"User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    "Accept":"application/json"}
_lk=threading.Lock(); _last=[0.0]; GAP=0.14
def _thr():
    with _lk:
        d=time.time()-_last[0]
        if d<GAP: time.sleep(GAP-d)
        _last[0]=time.time()

def chave(mc, mo, ano):
    am, cb = ano.split("-")
    payload={"codigoTabelaReferencia":REF,"codigoMarca":mc,"codigoModelo":mo,"codigoTipoVeiculo":1,
             "anoModelo":int(am),"codigoTipoCombustivel":int(cb),"tipoVeiculo":"carro",
             "modeloCodigoExterno":"","tipoConsulta":"tradicional","ano":ano}
    return os.path.join(CACHE,"ConsultarValorComTod_"+hashlib.md5(
        json.dumps(payload,sort_keys=True).encode()).hexdigest()+".json")

def em_cache(mc, mo, ano): return os.path.exists(chave(mc,mo,ano))

def valor_par(mc, mo, ano, retries=3):
    k=chave(mc,mo,ano)
    if os.path.exists(k):
        try: return json.load(open(k))
        except: pass
    url=f"https://parallelum.com.br/fipe/api/v1/carros/marcas/{mc}/modelos/{mo}/anos/{ano}"
    for i in range(retries):
        try:
            _thr()
            req=urllib.request.Request(url, headers=HP)
            with urllib.request.urlopen(req, timeout=25) as r:
                d=json.loads(r.read().decode("utf-8"))
            if isinstance(d,dict) and "Valor" in d:
                json.dump(d, open(k,"w")); return d
            return None                      # veiculo nao existe p/ essa referencia
        except urllib.error.HTTPError as e:
            if e.code in (404,400): return None
            time.sleep(0.6*(i+1))
        except Exception:
            time.sleep(0.6*(i+1))
    return None
