#!/usr/bin/env python3
"""Procura classes CSS definidas em mais de um arquivo de estilo.

Existe porque uma colisao real aconteceu: o extrato de custo foi criado como
`.conta`, nome que a secao de leitura em rolagem ja usava com `display:grid` e
duas colunas. O extrato herdou o grid e virou duas colunas sobrepostas, sem
nenhum erro de sintaxe para denunciar.

Uso: python3 scripts/checar-css.py
Sai com codigo 1 quando encontra colisao fora de media query.
"""
import re, sys, os

ARQUIVOS = ["part1.html", "part2.css", "part3.css", "part3b.css"]
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def regras(caminho):
    """Devolve (classe, dentro_de_media) para cada regra de topo."""
    s = open(os.path.join(RAIZ, caminho), encoding="utf-8").read()
    saida, prof_media = [], []
    for linha in s.split("\n"):
        if "@media" in linha:
            prof_media.append(True)
        m = re.match(r'\s*\.([a-zA-Z][\w-]*)\s*[{,]', linha)
        if m:
            saida.append((m.group(1), bool(prof_media) and linha.startswith("  ")))
        if linha.strip() == "}" and prof_media:
            prof_media.pop()
    return saida

def main():
    onde = {}
    for arq in ARQUIVOS:
        for classe, em_media in regras(arq):
            if em_media:
                continue
            onde.setdefault(classe, set()).add(arq)
    colisoes = {c: sorted(a) for c, a in onde.items() if len(a) > 1}
    if colisoes:
        print("COLISAO de classe entre arquivos:")
        for c, a in sorted(colisoes.items()):
            print(f"  .{c}  em  {', '.join(a)}")
        return 1
    print(f"ok, {len(onde)} classes conferidas, nenhuma colisao")
    return 0

if __name__ == "__main__":
    sys.exit(main())
