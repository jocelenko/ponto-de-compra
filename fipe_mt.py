import json, urllib.request, time, os, hashlib, threading
BASE="https://veiculos.fipe.org.br/api/veiculos/"; REF=336
HDRS={"Content-Type":"application/json","Referer":"https://veiculos.fipe.org.br/",
 "Origin":"https://veiculos.fipe.org.br",
 "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
CACHE="cache2"; os.makedirs(CACHE, exist_ok=True)
_lock=threading.Lock(); _last=[0.0]; MIN_GAP=1.15

def _throttle():
    with _lock:
        d=time.time()-_last[0]
        if d<MIN_GAP: time.sleep(MIN_GAP-d)
        _last[0]=time.time()

def post(ep,payload,retries=5):
    k=os.path.join(CACHE, ep[:20]+"_"+hashlib.md5(json.dumps(payload,sort_keys=True).encode()).hexdigest()+".json")
    if os.path.exists(k):
        try: return json.load(open(k))
        except: pass
    for i in range(retries):
        try:
            _throttle()
            req=urllib.request.Request(BASE+ep,data=json.dumps(payload).encode(),headers=HDRS,method="POST")
            with urllib.request.urlopen(req,timeout=30) as r:
                d=json.loads(r.read().decode("utf-8"))
            json.dump(d,open(k,"w")); return d
        except Exception as e:
            if i==retries-1: return None
            time.sleep(min(3.0*(i+1), 20) + (hash(k)%100)/200.0)

def modelos(m):
    d=post("ConsultarModelos",{"codigoTabelaReferencia":REF,"codigoTipoVeiculo":1,"codigoMarca":m}); return d["Modelos"] if d else []
def anos(m,mo):
    return post("ConsultarAnoModelo",{"codigoTabelaReferencia":REF,"codigoTipoVeiculo":1,"codigoMarca":m,"codigoModelo":mo}) or []
def valor(m,mo,a):
    am,c=a.split("-")
    return post("ConsultarValorComTodosParametros",{"codigoTabelaReferencia":REF,"codigoMarca":m,
      "codigoModelo":mo,"codigoTipoVeiculo":1,"anoModelo":int(am),"codigoTipoCombustivel":int(c),
      "tipoVeiculo":"carro","modeloCodigoExterno":"","tipoConsulta":"tradicional","ano":a})
