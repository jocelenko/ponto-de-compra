# Ponto de Compra

Quanto um carro custa **por ano de posse**, e não quanto ele custa na vitrine.

Este projeto varre a Tabela FIPE inteira, mede a curva de depreciação real de cada
modelo e soma o que custa manter o carro, para responder qual compra vale mais a pena.

## O achado principal

Todo mundo repete que carro despenca nos primeiros anos e depois estabiliza.
**Medida na FIPE, a queda é quase constante**, perto de 6% ao ano, e o carro leva
cerca de 12 anos para valer metade.

O tombo famoso existe, mas acontece fora dessa curva: é entre o que você paga na
concessionária e o que a FIPE diz que o carro vale no dia seguinte.

Segundo achado: **escolher o modelo pesa cerca de 4x mais que escolher o ano.**
Entre idades, a mediana do custo anual varia 28%. Dentro da mesma idade, a distância
entre o modelo mais barato e o mais caro passa de 110%.

## Como a conta é feita

Custo por ano de posse soma cinco componentes:

| Componente | Origem |
|---|---|
| Depreciação | **Medida** na Tabela FIPE |
| IPVA | Estimativa, alíquota ajustável |
| Seguro | Estimativa, percentual do valor FIPE |
| Manutenção | Estimativa por marca, idade e porte |
| Energia | Estimativa, km/l ou kWh/100km |

Na interface, todo número **estimado** aparece com sublinhado tracejado. Número
**medido** na FIPE sai limpo. Essa separação é regra do produto, não detalhe visual.

### Índice encadeado

A FIPE renomeia as versões a cada geração, então a mediana crua de um ano não é
comparável com a do ano seguinte. A série é montada por **índice encadeado**: a
variação de um ano para o outro sai apenas das versões presentes nos **dois** anos.
Sem isso, mudança de nome de acabamento vira depreciação falsa.

## Rodando a coleta

A FIPE não publica CSV nem dump, só consulta versão por versão. Os dados são
coletados um a um pela API oficial, com `parallelum.com.br` como segunda fonte.

```bash
python3 fetch_v2.py    # coleta, retomavel: pula o que ja esta no cache
python3 rebuild.py     # reconstroi o dataset lendo o cache inteiro
python3 export4.py     # gera dados.json
python3 build.py       # monta o HTML final
```

> **Atenção:** sempre reconstrua com `rebuild.py`. Uma execução interrompida deixa
> preços no cache mas não no dataset, e confiar no dataset parcial já causou a perda
> silenciosa de marcas inteiras.

O cache de respostas cruas não vai versionado por ser grande demais. Ele é
reconstruível rodando a coleta.

## Estrutura

| Caminho | O que é |
|---|---|
| `docs/index.html` | o painel, arquivo único e autossuficiente (é o que o GitHub Pages serve) |
| `fetch_v2.py` | coleta na API, com cache e retomada |
| `rebuild.py` | reconstrói o dataset a partir do cache |
| `analise4.py` | índice encadeado e curva de retenção |
| `custos3.py` | parâmetros de custo por marca e segmento |
| `derive.py` | agrupa versões em modelos |
| `export4.py` | gera o `dados.json` do painel |
| `build.py` | monta o HTML final |
| `PRODUCT.md` | o que é o produto e para quem |
| `DESIGN.md` | sistema visual e regras duráveis |

## Limitações que você precisa saber

- FIPE é **referência, não preço de loja**. Negociação, cor, quilometragem e estado
  mexem uns 10% para cada lado.
- Manutenção, seguro, consumo, liquidez e risco de câmbio são **estimativas de
  mercado**, não medição de fonte primária.
- Modelos com menos de quatro anos na tabela têm curva fraca e vêm marcados.
- O maior risco não está nesta conta: um exemplar mal cuidado apaga qualquer
  vantagem calculada aqui. Vistoria cautelar e laudo de motor e câmbio antes de fechar.

## Site publicado

<https://jocelenko.github.io/ponto-de-compra/>

O GitHub Pages serve a pasta `docs/`. Para atualizar o site, rode `python3 build.py`
e copie o resultado:

```bash
python3 build.py && cp ponto-de-compra.html docs/index.html
```

## Licença

MIT para o código. Os preços são da Tabela FIPE e pertencem à Fundação Instituto de
Pesquisas Econômicas.
