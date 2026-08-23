import json, urllib.request, urllib.error, time, os

BASE = "https://veiculos.fipe.org.br/api/veiculos/"
REF = 336  # agosto/2026
HDRS = {
    "Content-Type": "application/json",
    "Referer": "https://veiculos.fipe.org.br/",
    "Origin": "https://veiculos.fipe.org.br",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
}
CACHE = "cache"
os.makedirs(CACHE, exist_ok=True)

def post(ep, payload, retries=6):
    key = os.path.join(CACHE, (ep + "_" + json.dumps(payload, sort_keys=True)).replace("/", "_").replace(" ", "").replace('"','').replace(":","-").replace(",","_").replace("{","").replace("}","")[:180] + ".json")
    if os.path.exists(key):
        return json.load(open(key))
    for i in range(retries):
        try:
            req = urllib.request.Request(BASE + ep, data=json.dumps(payload).encode(), headers=HDRS, method="POST")
            with urllib.request.urlopen(req, timeout=30) as r:
                d = json.loads(r.read().decode("utf-8"))
            json.dump(d, open(key, "w"))
            time.sleep(0.35)
            return d
        except Exception as e:
            if i == retries - 1:
                print("FAIL", ep, payload, e)
                return None
            time.sleep(2.0 * (i + 1))

def modelos(marca):
    d = post("ConsultarModelos", {"codigoTabelaReferencia": REF, "codigoTipoVeiculo": 1, "codigoMarca": marca})
    return d["Modelos"] if d else []

def anos(marca, modelo):
    d = post("ConsultarAnoModelo", {"codigoTabelaReferencia": REF, "codigoTipoVeiculo": 1, "codigoMarca": marca, "codigoModelo": modelo})
    return d or []

def valor(marca, modelo, ano_str):
    am, comb = ano_str.split("-")
    return post("ConsultarValorComTodosParametros", {
        "codigoTabelaReferencia": REF, "codigoMarca": marca, "codigoModelo": modelo,
        "codigoTipoVeiculo": 1, "anoModelo": int(am), "codigoTipoCombustivel": int(comb),
        "tipoVeiculo": "carro", "modeloCodigoExterno": "", "tipoConsulta": "tradicional", "ano": ano_str})
