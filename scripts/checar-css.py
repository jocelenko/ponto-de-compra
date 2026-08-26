#!/usr/bin/env python3
"""Procura colisão de nome de classe.

O modo de falha já aconteceu três vezes neste projeto e nunca gerou erro de
sintaxe nem aviso de navegador: um elemento recebe duas classes que têm, cada
uma, definição global própria mexendo em caixa (display, padding, background,
border, opacity, transform, position). O layout simplesmente sai errado.

  1. class="conta"      -> .conta era grid de duas colunas do scrollytelling
  2. class="val est"    -> .est dava borda tracejada e esmagava o padding
  3. class="nota"       -> .nota era um bloco com fundo e 15px

Roda sobre o HTML montado, então pega markup estático e template literal de JS.
"""
import re, sys, pathlib

RAIZ = pathlib.Path(__file__).resolve().parent.parent
CSS  = ["part2.css", "part3.css", "part3b.css"]
HTML = "ponto-de-compra.html"

# propriedades que reposicionam ou redimensionam. cor e fonte não colidem de forma perigosa.
# o sufixo importa: padding-bottom e padding brigam pelo mesmo espaço, então
# a propriedade é normalizada para a família antes de comparar
CAIXA = re.compile(r"(?:^|[;{\s])(display|position|padding|margin|background|border|opacity|transform|"
                   r"grid-template|flex-direction|width|height|inset|top|right|bottom|left|float|"
                   r"visibility|overflow|gap)(?:-[a-z-]+)?\s*:")

def defs_globais():
    """classe -> propriedades de caixa que ela define num seletor global e solto."""
    achado = {}
    for nome in CSS:
        txt = (RAIZ / nome).read_text(encoding="utf-8")
        txt = re.sub(r"/\*.*?\*/", "", txt, flags=re.S)
        for sel, corpo in re.findall(r"([^{}]+)\{([^{}]*)\}", txt):
            props = set(CAIXA.findall(corpo))
            if not props:
                continue
            for parte in sel.split(","):
                parte = parte.strip()
                # só seletor de uma classe só, sem ancestral e sem elemento antes
                m = re.fullmatch(r"\.([A-Za-z0-9_-]+)((?::[a-z-]+(?:\([^)]*\))?)*)", parte)
                if m:
                    achado.setdefault(m.group(1), {"props": set(), "onde": set()})
                    achado[m.group(1)]["props"] |= props
                    achado[m.group(1)]["onde"].add(f"{nome}: {parte}")
    return achado

def classes_usadas():
    txt = (RAIZ / HTML).read_text(encoding="utf-8")
    grupos = []
    for m in re.finditer(r'class="([^"${}]+)"', txt):
        cs = m.group(1).split()
        if len(cs) > 1:
            grupos.append(tuple(sorted(set(cs))))
    return sorted(set(grupos))

def main():
    defs = defs_globais()
    alarmes = []
    for grupo in classes_usadas():
        batem = [c for c in grupo if c in defs]
        if len(batem) < 2:
            continue
        for i in range(len(batem)):
            for j in range(i + 1, len(batem)):
                a, b = batem[i], batem[j]
                comum = defs[a]["props"] & defs[b]["props"]
                if comum:
                    alarmes.append((" ".join(grupo), a, b, sorted(comum),
                                    sorted(defs[a]["onde"]), sorted(defs[b]["onde"])))
    if not alarmes:
        print(f"ok, {len(defs)} classes globais, nenhuma colisão de caixa")
        return 0
    for cls, a, b, props, oa, ob in alarmes:
        print(f'\nclass="{cls}"')
        print(f"  .{a} e .{b} disputam: {', '.join(props)}")
        print(f"    .{a} -> {'; '.join(oa)}")
        print(f"    .{b} -> {'; '.join(ob)}")
    print(f"\n{len(alarmes)} colisão(ões). Renomeie o modificador de bloco, nunca a utilitária.")
    return 1

sys.exit(main())
