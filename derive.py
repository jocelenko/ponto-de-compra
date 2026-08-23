# -*- coding: utf-8 -*-
"""Agrupa versoes FIPE em familias.
Nivel 1: familias curadas a mao (mercado brasileiro de volume).
Nivel 2: heuristica para todo o resto, para nao pre-selecionar nada."""
import re
from families import FAMILIES
from families_cn import FAM_CN

# ---- energia
RE_EV   = re.compile(r'el[eé]tric', re.I)
RE_HIB  = re.compile(r'h[ií]brid', re.I)
RE_DIE  = re.compile(r'\b(diesel|tdi|cti|crdi|d4-d|tdci|hdi|jtd|dci|bluetec|turbodiesel)\b', re.I)
def energia(label):
    if RE_EV.search(label):  return "eletrico"
    if RE_HIB.search(label): return "hibrido"
    if RE_DIE.search(label): return "diesel"
    return "flex"
SUF = {"flex":"", "hibrido":" Hibrido", "eletrico":" Eletrico", "diesel":" Diesel"}

# ---- curadas
CUR = []
for nome, mc, marca, seg, inc, exc in FAMILIES:
    CUR.append((nome, marca, seg, [mc], re.compile(inc, re.I),
                re.compile(exc, re.I) if exc else None))
for nome, cods, marca, seg, inc, exc, _f in FAM_CN:
    CUR.append((nome, marca, seg, cods, re.compile(inc, re.I),
                re.compile(exc, re.I) if exc else None))

# ---- heuristica
SPEC = re.compile(r'^(\d[\.,]\d|\d{1,2}v$|\d+p$|\d+cv$|flex|aut|cvt|mec|turbo|tb$|tsi|tgdi|msi|'
                  r'gdi|mpi|thp|vti|vvt|4x[24]|awd|fwd|4wd|cd$|cs$|cab|die|dies|diesel|tdi|hdi|dci|'
                  r'crdi|d4-d|cti|hi-flex|flexone|flexstart|flexpower|econo|multiair|firefly|'
                  r'\(|16v|12v|8v|20v|24v|32v|v6|v8|t270|t350|200|250|350)', re.I)
TRIM = set("""lt ltz ls premier midnight activ active advantage joy elite plus pro max drive sport
sense comfort comfortline highline trendline exclusive exclusiva life zen intense iconic dynamique
expression authentique authentic techroad gopro dakar limited longitude latitude trailhawk sahara
night eagle overland moab custom serie s se sl slx sv sr srv srx xei gli altis xrs dynamic upper
xl xs xls x ex exl exs exr lx lxl dx cx touring personal advance platinum diamond evolution vision
unique launch style impress ocean premium comfortable connect luxury prestige founder edition
gt gts gti rs r-line n line blackhawk hurricane freedom endurance ranch volcano ultra outsider
tributo abarth audace impetus opening blackjack road bluelink safety tech titanium ambiente
storm freestyle rock ambition allure griffe feel like business avantgarde amg m-sport""".split())
QUAL = {"cross","sedan","hatch","sw","coupe","cabrio","plus","rover","country","tourer","van",
        "wagon","fastback","sportback","targa","roadster","cc","gran","picape","pick-up","adventure",
        "vitara","cactus","aircross","picasso","spacetourer","partner","rifter","expert","jumpy",
        "oroch","stepway"}

def heuristica(marca, label):
    toks = [t for t in re.split(r'\s+', label.strip()) if t]
    if not toks: return marca
    fam = [toks[0]]
    for idx, t in enumerate(toks[1:3], start=1):
        tl = t.lower().strip(".,")
        if SPEC.match(t): break
        if re.match(r'^\d+[a-z]{0,2}$', tl):        # 7, 5X, 180, 320
            prox = toks[idx+1].lower() if idx+1 < len(toks) else ""
            if prox.startswith("ano"): break        # "100 Anos" e edicao, nao modelo
            fam.append(t); continue
        if re.match(r'^[a-z]$', tl):                # Classe A, Classe C
            fam.append(t.upper()); continue
        if tl in QUAL: fam.append(t); continue
        break
    nome = " ".join(fam).strip(" .,-")
    nome = re.sub(r'\s+', ' ', nome)
    # CAIXA ALTA sem numero vira Caixa Alta so na inicial (mantem HB20, RAV4, T-Cross)
    nome = " ".join(w.capitalize() if (w.isupper() and len(w) > 3 and not any(c.isdigit() for c in w))
                    else w for w in nome.split())
    return f"{marca} {nome}" if not nome.lower().startswith(marca.split()[0].lower()[:4]) else nome

MARCA_CURTA = {"GM - Chevrolet":"Chevrolet","VW - VolksWagen":"VW","Kia Motors":"Kia",
               "Caoa Chery/Chery":"Caoa Chery","Citroën":"Citroen","Mercedes-Benz":"Mercedes"}

_CANON = {}
for _n, _mk, _sg, _cd, _i, _e in CUR: _CANON.setdefault(_n.casefold(), _n)
def _canon(nome):
    k = nome.casefold()
    if k not in _CANON: _CANON[k] = nome
    return _CANON[k]

def familia(marcaLabel, marcaCod, trimLabel):
    marca = MARCA_CURTA.get(marcaLabel, marcaLabel)
    e = energia(trimLabel)
    for nome, mk, seg, cods, inc, exc in CUR:
        if marcaCod in cods and inc.search(trimLabel) and not (exc and exc.search(trimLabel)):
            return _canon(nome) + SUF[e], mk, seg, e, True
    return _canon(heuristica(marca, trimLabel)) + SUF[e], marca, None, e, False
