# -*- coding: utf-8 -*-
"""Parametros de custo por marca, cobrindo todo o universo FIPE.
Tudo estimativa de mercado (Brasil, 2026), ajustavel no painel."""
from custos2 import (GARANTIA, MANUT_BASE, MANUT_ENERGIA, mult_idade, KML_ENERGIA, OVER)

# garantia de fabrica no Brasil, em anos
GARANTIA = dict(GARANTIA, **{
 "Ford":3,"Peugeot":3,"Citroen":3,"Kia":5,"Mitsubishi":3,"Suzuki":3,"Subaru":3,
 "Mercedes":2,"BMW":3,"Audi":3,"Volvo":3,"Land Rover":3,"Jaguar":3,"MINI":3,
 "Porsche":3,"Lexus":4,"RAM":3,"Dodge":3,"Chrysler":3,"SSANGYONG":3,"Mazda":3,
 "MG":6,"GAC":6,"NETA":5,"ZEEKR":5,"Leapmotor":5,"SERES":5,"HITECH ELECTRIC":3,
 "Troller":3,"Alfa Romeo":3,"Maserati":3,"Ferrari":3,"Rolls-Royce":4,"Mclaren":3,
 "LAMBORGHINI":3,"Daewoo":0,"LIFAN":3,"GEELY":3,"FOTON":3,"IVECO":3,"Agrale":3,
 "EFFA":3,"DFSK":3,"FEVER":3,"Chery":6,"Caoa Changan":6,
})

# manutencao base R$/ano de um carro novo, por marca
MANUT_BASE = dict(MANUT_BASE, **{
 "Ford":1900,"Peugeot":2000,"Citroen":2000,"Kia":1700,"Mitsubishi":2100,"Suzuki":1800,
 "Subaru":2400,"Mazda":2000,"SSANGYONG":2200,"Dodge":2600,"Chrysler":2700,"RAM":3000,
 "MG":1800,"GAC":1800,"NETA":1800,"ZEEKR":2600,"Leapmotor":1800,"SERES":1800,
 "Troller":2400,"Alfa Romeo":3400,"MINI":3600,"Volvo":3800,"Land Rover":5200,
 "Jaguar":5000,"Mercedes":4600,"BMW":4400,"Audi":4200,"Lexus":3200,"Porsche":7000,
 "Maserati":9000,"Ferrari":18000,"LAMBORGHINI":18000,"Rolls-Royce":20000,"Mclaren":16000,
 "HITECH ELECTRIC":1400,"Daewoo":1800,"LIFAN":1700,"GEELY":1800,"FOTON":2200,
 "IVECO":3000,"Agrale":2600,"EFFA":1700,"DFSK":1700,"FEVER":1600,"Caoa Changan":1800,
})

# seguro como % do valor FIPE ao ano
SEGURO = {"Ford":0.042,"Peugeot":0.042,"Citroen":0.042,"Kia":0.040,"Mitsubishi":0.038,
 "Suzuki":0.040,"Subaru":0.038,"Mazda":0.040,"SSANGYONG":0.038,"Dodge":0.040,
 "Chrysler":0.038,"RAM":0.034,"MG":0.044,"GAC":0.046,"NETA":0.046,"ZEEKR":0.040,
 "Leapmotor":0.046,"SERES":0.046,"Troller":0.036,"Alfa Romeo":0.038,"MINI":0.036,
 "Volvo":0.030,"Land Rover":0.032,"Jaguar":0.034,"Mercedes":0.030,"BMW":0.032,
 "Audi":0.032,"Lexus":0.028,"Porsche":0.028,"Maserati":0.030,"Ferrari":0.025,
 "LAMBORGHINI":0.025,"Rolls-Royce":0.022,"Mclaren":0.025,"HITECH ELECTRIC":0.048,
 "Daewoo":0.045,"LIFAN":0.046,"GEELY":0.044,"FOTON":0.040,"IVECO":0.036,
 "Agrale":0.038,"EFFA":0.046,"DFSK":0.046,"FEVER":0.046,"Caoa Changan":0.044}

# risco de cambio 1(baixo) a 5(alto) e liquidez de revenda 1(baixa) a 5(alta)
RISCO = {"Ford":3,"Peugeot":3,"Citroen":3,"Kia":2,"Mitsubishi":2,"Suzuki":2,"Subaru":2,
 "Mazda":2,"SSANGYONG":3,"Dodge":3,"Chrysler":3,"RAM":2,"MG":3,"GAC":2,"NETA":2,
 "ZEEKR":2,"Leapmotor":2,"SERES":2,"Troller":2,"Alfa Romeo":4,"MINI":4,"Volvo":3,
 "Land Rover":4,"Jaguar":4,"Mercedes":3,"BMW":3,"Audi":4,"Lexus":1,"Porsche":3,
 "Maserati":4,"Ferrari":3,"LAMBORGHINI":3,"Rolls-Royce":3,"Mclaren":4,
 "HITECH ELECTRIC":3,"Daewoo":4,"LIFAN":4,"GEELY":3,"FOTON":4,"IVECO":3,"Agrale":3,
 "EFFA":4,"DFSK":4,"FEVER":4,"Caoa Changan":3}
LIQ = {"Ford":3,"Peugeot":2,"Citroen":2,"Kia":3,"Mitsubishi":3,"Suzuki":2,"Subaru":2,
 "Mazda":1,"SSANGYONG":1,"Dodge":2,"Chrysler":1,"RAM":3,"MG":1,"GAC":1,"NETA":1,
 "ZEEKR":1,"Leapmotor":1,"SERES":1,"Troller":2,"Alfa Romeo":1,"MINI":2,"Volvo":2,
 "Land Rover":2,"Jaguar":1,"Mercedes":3,"BMW":3,"Audi":2,"Lexus":2,"Porsche":3,
 "Maserati":1,"Ferrari":2,"LAMBORGHINI":2,"Rolls-Royce":1,"Mclaren":1,
 "HITECH ELECTRIC":1,"Daewoo":1,"LIFAN":1,"GEELY":1,"FOTON":1,"IVECO":2,"Agrale":1,
 "EFFA":1,"DFSK":1,"FEVER":1,"Caoa Changan":1}

# ---- segmentos, incluindo os inferidos para familias fora da curadoria
MULT_SEG = {"Hatch compacto":1.00,"Sedan compacto":1.05,"SUV compacto":1.20,
            "Monovolume 7L":1.15,"Sedan medio":1.25,"SUV medio":1.45,
            "Compacto":1.05,"Medio":1.25,"SUV":1.30,"Picape":1.35,
            "Grande":1.60,"Premium":1.95}
KML_SEG = {"Hatch compacto":11.5,"Sedan compacto":11.5,"SUV compacto":10.8,
           "Monovolume 7L":9.5,"Sedan medio":10.5,"SUV medio":9.8,
           "Compacto":11.5,"Medio":10.5,"SUV":10.0,"Picape":9.0,
           "Grande":8.5,"Premium":8.0}
KWH100_SEG = {"Hatch compacto":13.5,"Sedan compacto":14.5,"SUV compacto":16.5,
              "Monovolume 7L":18.0,"Sedan medio":17.0,"SUV medio":18.5,
              "Compacto":14.0,"Medio":17.0,"SUV":18.0,"Picape":22.0,
              "Grande":20.0,"Premium":21.0}

import re
RE_PICAPE = re.compile(r'\b(cd|cs|cab\.?\s?dupla|c\.dupla|cabine|pick-?up|picape|chassi)\b', re.I)
RE_SUV    = re.compile(r'\b(suv|4x4|awd|4wd|sw4|trailhawk|land|pajero|outlander|tucson|sorento|'
                       r'sportage|captiva|trailblazer|edge|territory|bronco|commander|discovery|'
                       r'range|defender|jimny|xc\s?\d|gl[abcees]|x[1-7]\b|q[2-8]\b)', re.I)

def inferir_segmento(nome_familia, exemplo_label, preco_novo):
    if RE_PICAPE.search(exemplo_label): return "Picape"
    p = preco_novo or 0
    if RE_SUV.search(exemplo_label) or RE_SUV.search(nome_familia):
        return "SUV" if p < 260000 else "Premium"
    if p >= 400000: return "Premium"
    if p >= 230000: return "Grande"
    if p >= 130000: return "Medio"
    return "Compacto"

def params(nome, marca, segmento, energia):
    o = OVER.get(nome, {})
    p = dict(
        seguro = o.get("seguro", SEGURO.get(marca, 0.043)),
        risco  = o.get("risco",  RISCO.get(marca, 3)),
        liq    = o.get("liq",    LIQ.get(marca, 2)),
        manutBase = MANUT_BASE.get(marca, 2000) * MANUT_ENERGIA.get(energia, 1.0),
        garantia  = GARANTIA.get(marca, 3),
        energia = energia,
    )
    if "cambio" in o: p["cambio"] = o["cambio"]
    else:
        p["cambio"] = {"eletrico":"Redução única","hibrido":"e-CVT / DHT",
                       "diesel":"Automático diesel"}.get(energia, "Automático")
    if energia == "eletrico":
        p["kwh100"] = o.get("kwh100", KWH100_SEG.get(segmento, 17.0)); p["kml"] = None
    else:
        p["kml"] = o.get("kml", KML_SEG.get(segmento, 10.5) * KML_ENERGIA.get(energia, 1.0))
        p["kwh100"] = None
    return p
