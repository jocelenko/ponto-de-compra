# -*- coding: utf-8 -*-
"""Camada de custo de propriedade. Valores sao ESTIMATIVAS de mercado (Brasil, 2026),
nao vem da FIPE. Todos ajustaveis no dashboard."""

# Garantia de fabrica no Brasil, em anos (transferivel ao 2o dono)
GARANTIA = {"Chevrolet":3,"Hyundai":5,"VW":3,"Fiat":3,"Toyota":3,
            "Honda":3,"Nissan":3,"Renault":3,"Jeep":3}

# Custo base de manutencao R$/ano (revisao + desgaste), carro novo, ~12k km/ano
MANUT_BASE = {"Fiat":1400,"Chevrolet":1500,"Toyota":1500,"Hyundai":1600,
              "Nissan":1750,"VW":1800,"Honda":1800,"Renault":1800,"Jeep":2600}

# Multiplicador por idade (desgaste acumulado)
def mult_idade(a):
    if a <= 3:  return 1.0
    if a <= 5:  return 1.6
    if a <= 7:  return 2.2
    if a <= 9:  return 3.0
    return 3.8

MULT_SEG = {"Hatch compacto":1.00,"Sedan compacto":1.05,"SUV compacto":1.20,
            "Monovolume 7L":1.15,"Sedan medio":1.25,"SUV medio":1.45}

# Por familia: consumo misto km/l (gasolina), seguro % do valor FIPE/ano,
# risco de cambio 1(baixo)-5(alto), liquidez de revenda 1(baixa)-5(alta), cambio
FAM = {
 "Chevrolet Onix":       dict(kml=11.5, seg=0.052, risco=1, liq=5, cambio="AT6 Aisin"),
 "Hyundai HB20":         dict(kml=11.5, seg=0.047, risco=1, liq=5, cambio="AT6 Aisin"),
 "VW Polo":              dict(kml=11.8, seg=0.045, risco=2, liq=4, cambio="AT6 Aisin"),
 "Fiat Argo":            dict(kml=11.5, seg=0.046, risco=2, liq=4, cambio="CVT / AT6"),
 "Toyota Yaris Hatch":   dict(kml=12.5, seg=0.040, risco=1, liq=4, cambio="CVT Toyota"),
 "Honda City Hatch":     dict(kml=12.5, seg=0.042, risco=2, liq=4, cambio="CVT Honda"),
 "Renault Sandero":      dict(kml=10.5, seg=0.045, risco=3, liq=3, cambio="AT4 / CVT"),
 "Honda Fit":            dict(kml=11.5, seg=0.042, risco=2, liq=3, cambio="CVT Honda"),
 "Toyota Etios Hatch":   dict(kml=12.0, seg=0.042, risco=1, liq=3, cambio="AT4 Aisin"),
 "Chevrolet Onix Plus":  dict(kml=11.8, seg=0.050, risco=1, liq=5, cambio="AT6 Aisin"),
 "VW Virtus":            dict(kml=12.0, seg=0.043, risco=2, liq=4, cambio="AT6 Aisin"),
 "Hyundai HB20S":        dict(kml=11.8, seg=0.046, risco=1, liq=5, cambio="AT6 Aisin"),
 "Fiat Cronos":          dict(kml=11.5, seg=0.045, risco=2, liq=4, cambio="CVT / AT6"),
 "Toyota Yaris Sedan":   dict(kml=12.5, seg=0.040, risco=1, liq=4, cambio="CVT Toyota"),
 "Nissan Versa":         dict(kml=11.5, seg=0.042, risco=3, liq=3, cambio="CVT Jatco"),
 "Honda City Sedan":     dict(kml=12.5, seg=0.042, risco=2, liq=4, cambio="CVT Honda"),
 "Chevrolet Prisma":     dict(kml=11.0, seg=0.050, risco=2, liq=4, cambio="AT6 Aisin"),
 "Renault Logan":        dict(kml=10.5, seg=0.044, risco=3, liq=2, cambio="AT4 / CVT"),
 "Chevrolet Tracker":    dict(kml=11.0, seg=0.042, risco=1, liq=4, cambio="AT6 Aisin"),
 "Hyundai Creta":        dict(kml=10.8, seg=0.040, risco=1, liq=4, cambio="AT6 Aisin"),
 "VW T-Cross":           dict(kml=11.0, seg=0.040, risco=2, liq=4, cambio="AT6 Aisin"),
 "VW Nivus":             dict(kml=11.2, seg=0.040, risco=2, liq=3, cambio="AT6 Aisin"),
 "Fiat Pulse":           dict(kml=10.8, seg=0.043, risco=2, liq=3, cambio="CVT"),
 "Fiat Fastback":        dict(kml=10.8, seg=0.042, risco=2, liq=3, cambio="CVT"),
 "Jeep Renegade":        dict(kml=9.5,  seg=0.038, risco=2, liq=3, cambio="AT6 Aisin"),
 "Nissan Kicks":         dict(kml=11.0, seg=0.040, risco=3, liq=3, cambio="CVT Jatco"),
 "Renault Duster":       dict(kml=9.8,  seg=0.040, risco=3, liq=2, cambio="CVT X-Tronic"),
 "Renault Captur":       dict(kml=10.0, seg=0.040, risco=4, liq=2, cambio="EDC / CVT"),
 "Honda HR-V":           dict(kml=11.5, seg=0.038, risco=2, liq=4, cambio="CVT Honda"),
 "Honda WR-V":           dict(kml=11.5, seg=0.040, risco=2, liq=3, cambio="CVT Honda"),
 "Hyundai HB20X":        dict(kml=11.0, seg=0.044, risco=1, liq=3, cambio="AT6 Aisin"),
 "Toyota Corolla":       dict(kml=11.5, seg=0.035, risco=1, liq=5, cambio="CVT Toyota"),
 "Toyota Corolla Cross": dict(kml=11.0, seg=0.034, risco=1, liq=5, cambio="CVT Toyota"),
 "Honda Civic":          dict(kml=10.5, seg=0.045, risco=2, liq=4, cambio="CVT Honda"),
 "Chevrolet Cruze":      dict(kml=10.5, seg=0.040, risco=2, liq=2, cambio="AT6 Aisin"),
 "Jeep Compass":         dict(kml=9.5,  seg=0.036, risco=2, liq=3, cambio="AT6 Aisin"),
 "VW Jetta":             dict(kml=10.5, seg=0.038, risco=3, liq=2, cambio="DSG"),
 "Nissan Sentra":        dict(kml=10.5, seg=0.040, risco=3, liq=2, cambio="CVT Jatco"),
 "Chevrolet Spin":       dict(kml=9.5,  seg=0.046, risco=1, liq=4, cambio="AT6 Aisin"),
}
