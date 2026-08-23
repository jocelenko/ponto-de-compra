# -*- coding: utf-8 -*-
"""Camada de custo. Estimativas de mercado (Brasil, 2026), nao vem da FIPE."""

GARANTIA = {"Chevrolet":3,"Hyundai":5,"VW":3,"Fiat":3,"Toyota":3,"Honda":3,"Nissan":3,
            "Renault":3,"Jeep":3,"Caoa Chery":6,"BYD":6,"GWM":5,"Omoda":6,"Jaecoo":6,"JAC":6}

MANUT_BASE = {"Fiat":1400,"Chevrolet":1500,"Toyota":1500,"Hyundai":1600,"JAC":1600,
              "Nissan":1750,"VW":1800,"Honda":1800,"Renault":1800,"Caoa Chery":1750,
              "BYD":1700,"Omoda":1800,"Jaecoo":1800,"GWM":1900,"Jeep":2600}

# manutencao muda muito com o trem de forca
MANUT_ENERGIA = {"flex":1.00, "hibrido":0.95, "eletrico":0.60, "diesel":1.30}

def mult_idade(a):
    if a <= 3:  return 1.0
    if a <= 5:  return 1.6
    if a <= 7:  return 2.2
    if a <= 9:  return 3.0
    return 3.8

MULT_SEG = {"Hatch compacto":1.00,"Sedan compacto":1.05,"SUV compacto":1.20,
            "Monovolume 7L":1.15,"Sedan medio":1.25,"SUV medio":1.45}

# consumo padrao (km/l) por segmento, versao flex
KML_SEG = {"Hatch compacto":11.5,"Sedan compacto":11.5,"SUV compacto":10.8,
           "Monovolume 7L":9.5,"Sedan medio":10.5,"SUV medio":9.8}
KML_ENERGIA = {"flex":1.00, "hibrido":1.45, "diesel":1.20}   # eletrico usa kWh/100km
KWH100_SEG = {"Hatch compacto":13.5,"Sedan compacto":14.5,"SUV compacto":16.5,
              "Monovolume 7L":18.0,"Sedan medio":17.0,"SUV medio":18.5}

SEGURO_MARCA = {"Caoa Chery":0.042,"BYD":0.048,"GWM":0.045,"Omoda":0.045,
                "Jaecoo":0.045,"JAC":0.045}
RISCO_MARCA  = {"Caoa Chery":3,"BYD":2,"GWM":2,"Omoda":3,"Jaecoo":3,"JAC":4}
LIQ_MARCA    = {"Caoa Chery":2,"BYD":3,"GWM":2,"Omoda":1,"Jaecoo":1,"JAC":1}
CAMBIO_MARCA = {"Caoa Chery":"DCT / CVT","BYD":"Redução / e-CVT","GWM":"DHT híbrido",
                "Omoda":"DCT","Jaecoo":"DHT híbrido","JAC":"CVT / DCT"}
CAMBIO_ENERGIA = {"eletrico":"Redução única","hibrido":"e-CVT / DHT"}

# ajustes explicitos por familia (chave = nome do grupo, com sufixo de energia)
OVER = {
 "Chevrolet Onix":       dict(kml=11.5, seguro=0.052, risco=1, liq=5, cambio="AT6 Aisin"),
 "Hyundai HB20":         dict(kml=11.5, seguro=0.047, risco=1, liq=5, cambio="AT6 Aisin"),
 "VW Polo":              dict(kml=11.8, seguro=0.045, risco=2, liq=4, cambio="AT6 Aisin"),
 "Fiat Argo":            dict(kml=11.5, seguro=0.046, risco=2, liq=4, cambio="CVT / AT6"),
 "Toyota Yaris Hatch":   dict(kml=12.5, seguro=0.040, risco=1, liq=4, cambio="CVT Toyota"),
 "Honda City Hatch":     dict(kml=12.5, seguro=0.042, risco=2, liq=4, cambio="CVT Honda"),
 "Renault Sandero":      dict(kml=10.5, seguro=0.045, risco=3, liq=3, cambio="AT4 / CVT"),
 "Honda Fit":            dict(kml=11.5, seguro=0.042, risco=2, liq=3, cambio="CVT Honda"),
 "Toyota Etios Hatch":   dict(kml=12.0, seguro=0.042, risco=1, liq=3, cambio="AT4 Aisin"),
 "Chevrolet Onix Plus":  dict(kml=11.8, seguro=0.050, risco=1, liq=5, cambio="AT6 Aisin"),
 "VW Virtus":            dict(kml=12.0, seguro=0.043, risco=2, liq=4, cambio="AT6 Aisin"),
 "Hyundai HB20S":        dict(kml=11.8, seguro=0.046, risco=1, liq=5, cambio="AT6 Aisin"),
 "Fiat Cronos":          dict(kml=11.5, seguro=0.045, risco=2, liq=4, cambio="CVT / AT6"),
 "Toyota Yaris Sedan":   dict(kml=12.5, seguro=0.040, risco=1, liq=4, cambio="CVT Toyota"),
 "Nissan Versa":         dict(kml=11.5, seguro=0.042, risco=3, liq=3, cambio="CVT Jatco"),
 "Honda City Sedan":     dict(kml=12.5, seguro=0.042, risco=2, liq=4, cambio="CVT Honda"),
 "Chevrolet Prisma":     dict(kml=11.0, seguro=0.050, risco=2, liq=4, cambio="AT6 Aisin"),
 "Renault Logan":        dict(kml=10.5, seguro=0.044, risco=3, liq=2, cambio="AT4 / CVT"),
 "Chevrolet Tracker":    dict(kml=11.0, seguro=0.042, risco=1, liq=4, cambio="AT6 Aisin"),
 "Hyundai Creta":        dict(kml=10.8, seguro=0.040, risco=1, liq=4, cambio="AT6 Aisin"),
 "VW T-Cross":           dict(kml=11.0, seguro=0.040, risco=2, liq=4, cambio="AT6 Aisin"),
 "VW Nivus":             dict(kml=11.2, seguro=0.040, risco=2, liq=3, cambio="AT6 Aisin"),
 "Fiat Pulse":           dict(kml=10.8, seguro=0.043, risco=2, liq=3, cambio="CVT"),
 "Fiat Fastback":        dict(kml=10.8, seguro=0.042, risco=2, liq=3, cambio="CVT"),
 "Jeep Renegade":        dict(kml=9.5,  seguro=0.038, risco=2, liq=3, cambio="AT6 Aisin"),
 "Nissan Kicks":         dict(kml=11.0, seguro=0.040, risco=3, liq=3, cambio="CVT Jatco"),
 "Renault Duster":       dict(kml=9.8,  seguro=0.040, risco=3, liq=2, cambio="CVT X-Tronic"),
 "Renault Captur":       dict(kml=10.0, seguro=0.040, risco=4, liq=2, cambio="EDC / CVT"),
 "Honda HR-V":           dict(kml=11.5, seguro=0.038, risco=2, liq=4, cambio="CVT Honda"),
 "Honda WR-V":           dict(kml=11.5, seguro=0.040, risco=2, liq=3, cambio="CVT Honda"),
 "Hyundai HB20X":        dict(kml=11.0, seguro=0.044, risco=1, liq=3, cambio="AT6 Aisin"),
 "Toyota Corolla":       dict(kml=11.5, seguro=0.035, risco=1, liq=5, cambio="CVT Toyota"),
 "Toyota Corolla Hibrido":     dict(kml=17.0, seguro=0.035, risco=1, liq=5, cambio="e-CVT Toyota"),
 "Toyota Corolla Cross":       dict(kml=11.0, seguro=0.034, risco=1, liq=5, cambio="CVT Toyota"),
 "Toyota Corolla Cross Hibrido": dict(kml=16.5, seguro=0.034, risco=1, liq=5, cambio="e-CVT Toyota"),
 "Honda Civic":          dict(kml=10.5, seguro=0.045, risco=2, liq=4, cambio="CVT Honda"),
 "Honda Civic Hibrido":  dict(kml=17.5, seguro=0.045, risco=2, liq=4, cambio="e-CVT Honda"),
 "Chevrolet Cruze":      dict(kml=10.5, seguro=0.040, risco=2, liq=2, cambio="AT6 Aisin"),
 "Jeep Compass":         dict(kml=9.5,  seguro=0.036, risco=2, liq=3, cambio="AT6 Aisin"),
 "Jeep Compass Diesel":  dict(kml=12.0, seguro=0.036, risco=2, liq=3, cambio="AT9 diesel"),
 "Jeep Renegade Diesel": dict(kml=12.5, seguro=0.038, risco=2, liq=2, cambio="AT9 diesel"),
 "VW Jetta":             dict(kml=10.5, seguro=0.038, risco=3, liq=2, cambio="DSG"),
 "Nissan Sentra":        dict(kml=10.5, seguro=0.040, risco=3, liq=2, cambio="CVT Jatco"),
 "Chevrolet Spin":       dict(kml=9.5,  seguro=0.046, risco=1, liq=4, cambio="AT6 Aisin"),
 # chinesas
 "Caoa Chery Tiggo 2":   dict(kml=10.5, seguro=0.042, risco=3, liq=2, cambio="CVT"),
 "Caoa Chery Tiggo 3X":  dict(kml=11.0, seguro=0.042, risco=3, liq=2, cambio="CVT"),
 "Caoa Chery Tiggo 5X":  dict(kml=10.5, seguro=0.042, risco=3, liq=2, cambio="CVT"),
 "Caoa Chery Tiggo 5X Hibrido": dict(kml=15.5, seguro=0.042, risco=3, liq=2, cambio="DHT híbrido"),
 "Caoa Chery Tiggo 7":   dict(kml=10.0, seguro=0.042, risco=3, liq=2, cambio="DCT 7v"),
 "Caoa Chery Tiggo 7 Hibrido":  dict(kml=15.0, seguro=0.042, risco=3, liq=2, cambio="DHT híbrido"),
 "Caoa Chery Tiggo 8":   dict(kml=9.5,  seguro=0.042, risco=3, liq=2, cambio="DCT 7v"),
 "Caoa Chery Tiggo 8 Hibrido":  dict(kml=14.5, seguro=0.042, risco=3, liq=2, cambio="DHT híbrido"),
 "Caoa Chery Arrizo 5":  dict(kml=11.5, seguro=0.042, risco=3, liq=2, cambio="CVT"),
 "Caoa Chery Arrizo 6":  dict(kml=11.0, seguro=0.042, risco=3, liq=2, cambio="CVT / DCT"),
 "BYD Dolphin Mini Eletrico": dict(kwh100=12.5, seguro=0.048, risco=1, liq=3, cambio="Redução única"),
 "BYD Dolphin Eletrico":      dict(kwh100=14.5, seguro=0.048, risco=1, liq=3, cambio="Redução única"),
 "BYD Yuan Eletrico":         dict(kwh100=16.5, seguro=0.048, risco=1, liq=3, cambio="Redução única"),
 "BYD Seal Eletrico":         dict(kwh100=17.5, seguro=0.050, risco=1, liq=2, cambio="Redução única"),
 "BYD Song Hibrido":     dict(kml=18.0, seguro=0.048, risco=2, liq=3, cambio="e-CVT DM-i"),
 "BYD King Hibrido":     dict(kml=19.0, seguro=0.046, risco=2, liq=2, cambio="e-CVT DM-i"),
 "GWM Haval H6 Hibrido": dict(kml=15.0, seguro=0.045, risco=2, liq=2, cambio="DHT híbrido"),
 "GWM Ora 03 Eletrico":  dict(kwh100=15.0, seguro=0.046, risco=1, liq=2, cambio="Redução única"),
 "Omoda 5":              dict(kml=10.5, seguro=0.045, risco=3, liq=1, cambio="DCT"),
 "Jaecoo 7 Hibrido":     dict(kml=15.0, seguro=0.045, risco=3, liq=1, cambio="DHT híbrido"),
 "JAC T40":              dict(kml=10.5, seguro=0.045, risco=4, liq=1, cambio="CVT"),
 "JAC T50":              dict(kml=10.5, seguro=0.045, risco=4, liq=1, cambio="CVT"),
 "JAC T60":              dict(kml=9.5,  seguro=0.045, risco=4, liq=1, cambio="DCT"),
}

def params(nome, marca, segmento, energia):
    o = OVER.get(nome, {})
    p = dict(
        seguro = o.get("seguro", SEGURO_MARCA.get(marca, 0.043)),
        risco  = o.get("risco",  RISCO_MARCA.get(marca, 2)),
        liq    = o.get("liq",    LIQ_MARCA.get(marca, 3)),
        cambio = o.get("cambio", CAMBIO_ENERGIA.get(energia) or CAMBIO_MARCA.get(marca, "Automático")),
        manutBase = MANUT_BASE.get(marca, 1600) * MANUT_ENERGIA.get(energia, 1.0),
        garantia  = GARANTIA.get(marca, 3),
    )
    if energia == "eletrico":
        p["kwh100"] = o.get("kwh100", KWH100_SEG.get(segmento, 16.0)); p["kml"] = None
    else:
        p["kml"] = o.get("kml", KML_SEG.get(segmento, 11.0) * KML_ENERGIA.get(energia, 1.0))
        p["kwh100"] = None
    p["energia"] = energia
    return p
