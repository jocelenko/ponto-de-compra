import io, sys
import os
p = os.path.dirname(os.path.abspath(__file__)) + "/"
dados = open(p+"dados.json", encoding="utf-8").read()
parts = [
  # Sem doctype o navegador cai em BackCompat, que muda o box model.
  # Sem lang o leitor de tela le portugues com voz inglesa.
  '<!doctype html>\n<html lang="pt-BR">\n<head>',
  open(p+"part1.html", encoding="utf-8").read(),
  "<style>\n" + open(p+"part2.css", encoding="utf-8").read() + "\n" + open(p+"part3.css", encoding="utf-8").read() + "\n" + open(p+"part3b.css", encoding="utf-8").read() + "\n</style>\n",
  "</head>\n<body>",
  open(p+"part10.html", encoding="utf-8").read(),
  "<script>\nconst D = " + dados + ";\n",
  open(p+"meta.js", encoding="utf-8").read(),
] + [open(p+f, encoding="utf-8").read() for f in
     ["part4.js","part5.js","part5b.js","part6.js","part7.js","part8.js","part9.js"]] + ["\n</scr"+"ipt>\n</body>\n</html>\n"]
out = "\n".join(parts)
open(p+"ponto-de-compra.html","w",encoding="utf-8").write(out)
print(f"montado: {len(out)/1024:.0f} KB")

# publica direto na pasta que o GitHub Pages serve
import shutil, os
if os.path.isdir(p+"docs"):
    shutil.copyfile(p+"ponto-de-compra.html", p+"docs/index.html")
    print("docs/index.html atualizado")

# o detector só serve se rodar sozinho. colisão de classe não dá erro de sintaxe,
# então sem isso ela só aparece como layout torto na tela.
import subprocess
r = subprocess.run(["python3", p+"scripts/checar-css.py"], capture_output=True, text=True)
print(r.stdout.strip() or r.stderr.strip())
