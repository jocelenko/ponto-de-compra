# Análise FIPE - carro automático semi-novo (pausado em 21/08/2026)

## Onde parou
- **3.975 preços coletados**, cobrindo **42 das 107 marcas** da FIPE.
- Cache de **7.152 respostas** da API em `cache2/`. Nada precisa ser refeito: o fetcher lê o cache antes de chamar a rede.
- Faltam ~1.200 preços. Marcas pendentes que **importam** para a faixa R$ 50 a 120 mil:
  **Toyota (113 versões), VW (91), Renault (72), Suzuki (35), Subaru (34)**.
  Pendentes que não importam: Porsche, Volvo, RAM, SSANGYONG, Rolls-Royce, Alfa Romeo, Mazda, MG, Daewoo, Troller, ZEEKR, SERES.

## Como retomar
```
cd /Users/machome/Claude/fipe-analise
python3 fetch_all.py          # continua de onde parou, usa cache2
python3 export4.py            # gera dados.json
python3 build.py              # monta ponto-de-compra.html
```
`build.py` e `export4.py` têm caminho absoluto apontando para o scratchpad antigo. Corrigir para esta pasta antes de rodar.

## Problema em aberto: rate limit da FIPE
- A API oficial aceita ~1 req/s no começo e depois estrangula para ~0,05 req/s.
- Pausar 4 minutos alivia parcialmente.
- **Caminho promissório não implementado:** usar `parallelum.com.br/fipe/api/v1` como segunda fonte em paralelo.
  Testado e funciona: `/carros/marcas/{marca}/modelos/{modelo}/anos/{ano}-{comb}`.
  Vazão medida: 8 de 12 requisições em 2 s, muito melhor que a oficial.
  Atenção: o código de combustível importa (`-5` flex, `-1` gasolina, `-2` álcool, `-3` diesel).
  Usa os mesmos códigos de marca e modelo da API oficial.

## Decisões de método já fechadas
- **Índice encadeado matched-model**: a FIPE renomeia versões a cada geração, então a mediana crua de um ano não é
  comparável com a do ano seguinte. A variação ano a ano sai só das versões presentes nos dois anos. Cobriu 93% dos pares.
- Nível de preço ancorado no ano com mais versões listadas.
- Ano modelo futuro (2027 em agosto de 2026) excluído: é 0 km e colidia com 2026 na curva por idade.
- Versões **flex, híbridas, elétricas e diesel** separadas em linhas próprias (misturavam preço e custo de energia).
- Agrupamento em famílias: 68 curadas a mão (modelos de volume) + heurística por nome para o resto.

## Achados principais (com a base parcial, faixa R$ 50 a 120 mil, 5 anos de posse)
1. **Escolher o modelo pesa ~3x mais que escolher o ano.** Na mesma idade os modelos variam 31 a 36% no custo anual.
   A mediana entre idades varia só 9,6%.
2. **A curva de custo por ano é quase plana dos 1 aos 10 anos.** A depreciação cai (R$ 5,1 mil para R$ 3,0 mil)
   na mesma medida em que a manutenção sobe (R$ 1,8 mil para R$ 7,2 mil).
3. **O ponto ótimo é frágil.** Se a manutenção sair 50% acima do estimado, o melhor ano salta de 5 anos para 1 ano.
   É esse o argumento real a favor do semi-novo, e não a economia bruta.
4. Retenção mediana do mercado: 93,1% em 1 ano, 86,4% em 2, 81,4% em 3, 75,3% em 4, 71,4% em 5, 55,9% em 10.

## Não existe CSV da FIPE
A FIPE só publica consulta versão por versão. Dumps no GitHub estão velhos (fipe-json para em 2018).
Exportação completa comercial da fipe.online custa ~R$ 10 mil. Por isso a coleta é via API.


---

# Atualização (sessão 2)

## Bug crítico encontrado e corrigido
Os processos de coleta que morreram deixavam os preços gravados no `cache2/` mas **não** no `fipe_all.json`.
Ao retomar, esses jobs contavam como "já em cache" e eram pulados, então nunca entravam no dataset.
Resultado: o Corolla, boa parte do VW e do Renault estavam **ausentes** sem nenhum erro aparente.
Corrigido com `rebuild.py`, que reconstrói o dataset lendo o cache inteiro em vez de confiar no que cada
execução conseguiu salvar. Rodar `python3 rebuild.py` sempre que a coleta for interrompida.

## Estado final da coleta
- **5.187 preços, 100% dos jobs, zero faltando. 55 marcas.**
- Dataset do painel: **574 modelos, 54 marcas, 1.782 versões automáticas, 5.009 pontos**.
- Fora ficam só Alfa Romeo, Daewoo, Mazda e MG, que não têm nenhum ano modelo a partir de 2016.
- A Parallelum resolveu 451 dos 681 pendentes e a API oficial 230, em 6,6 minutos.

## Correções de modelagem
- **Curva de retenção**: não extrapola mais para idade menor que a observada, o que gerava retenção acima de 100%.
- **Joelho da curva removido**: não existe. A queda é constante, perto de 6% ao ano, e o carro leva 12 anos
  para valer metade. O tombo famoso é entre o preço de concessionária e a FIPE, fora desta série.
- **Provisão de bateria para elétrico**: sem ela, microcarro elétrico liderava o custo por ano de forma enganosa.
  Dobra a partir do oitavo ano. Controle ajustável no painel.
- **Famílias duplicadas por caixa** e edições comemorativas ("100 Anos") corrigidas em `derive.py`.
- **Matriz ordenada pelo score** do ranking, e não por custo bruto, para não encher o topo com utilitário de entrega.

## Adicionado nesta sessão
- Barra de busca por modelo ou marca, com autocomplete. Durante a busca o filtro de orçamento é desligado
  para o carro sempre aparecer, e todos os gráficos seguem o resultado.
- Painel "De onde sai esse ranking": explica cada um dos seis critérios, a fonte de cada um, e mostra o peso
  em percentual. Os cards trazem a nota de 0 a 100 por critério.

## Ainda em aberto
- Agrupamento heurístico erra em nomes compostos fora dos modelos de volume (Land Rover, Suzuki Grand Vitara).
- Manutenção estimada das marcas chinesas merece calibragem melhor.
- `teste.html` é uma cópia do painel que mostra uma seção por vez (`teste.html?secCurva`), útil porque a
  captura de tela do navegador só funciona no topo da página.

---

# Sessão 3: init, critique, polish (Impeccable)

## init
`PRODUCT.md` criado. Respostas que mudaram o produto:
- **Compartilhado aberto**, não só uso pessoal. Método e ressalvas viram produto, não rodapé.
- **Ferramenta viva sem prazo**, reatualizada quando a FIPE virar o mês.
- Inegociáveis: separar dado FIPE de estimativa, todos os controles ajustáveis, cobertura de todas as marcas.

## critique
Snapshot em `.impeccable/critique/`. **30/40**, 1 P0 e 2 P1.
Run **degradado**: os dois subagentes travaram por limite de taxa e foram reexecutados em contexto único.

## polish, o que foi corrigido
- **[P0] Proveniência visual.** Todo número estimado ganhou sublinhado pontilhado com explicação no `title`,
  e o cabeçalho traz uma chave que ensina o código na primeira dobra. 655 elementos marcados.
  `Preço FIPE` e `Faixa de versões` ficam limpos; `Revenda`, `Perde no período`, `Manutenção`,
  `Custo por km`, custo anual e as colunas de custo da tabela ficam pontilhados.
- **[P1] `meta viewport`** adicionada. Sem ela o celular renderizava a 980px.
- **[P1] Teclado.** Cabeçalhos de ordenação viraram `<button>` reais com `aria-sort`.
  A matriz passou a usar tabulação itinerante com setas, Home e End, então deixou de ocupar
  279 paradas de Tab na frente da tabela.
- **[P2] Idade do dado** virou status no cabeçalho, com aviso quando passa de 3 meses.
- **[P2] Rail agrupado** em "O que muda a resposta", "Premissas que eu estimei" e "Recorte",
  mais uma pista de rolagem na borda direita.
- **[P3] Borda lateral colorida** trocada por borda de 1px com fundo tintado. Detector limpo, exit 0.
- **Numeração 01-09 removida** (banimento do craft floor) e trocada por rótulo de papel epistêmico:
  Veredicto, Evidência, Detalhe, Dados, Método.
- CSS órfão (`.snum`) removido.

## Verificado
Contraste zero falhas nos dois temas. Render 35,6 ms, 5.190 nós. Sem erro de console.
Ordenação, setas na matriz e busca testados por script.

## Ainda em aberto
- Responsivo real não verificável neste ambiente (o painel do navegador ignora redimensionamento).
- Sem estado na URL, então não dá para compartilhar uma visão já filtrada. Seria o próximo maior ganho.
- Seção 04 repete o que a 03 entrega melhor.
- `teste.html` é ferramenta de desenvolvimento e não deve ir junto num deploy de diretório.

---

# Sessão 4: redesign para o cânone big tech

## Mudança de direção, registrada
Duas direções autorais foram construídas e recusadas: dashboard escuro com acento teal, depois
classificados de jornal com cartela de para-brisa. O autor pediu o caminho convencional e escolheu
**Apple e Airbnb** como régua. Isso virou compromisso permanente em `PRODUCT.md` e o `DESIGN.md`
foi reescrito para descrever o mundo construído. Não reabrir a discussão de estética sem ele pedir.

## O que a v4 resolveu
- **Menu lateral eliminado.** Barra superior de 60px com navegação inline. Zero largura permanente.
- **Filtros de volta e ampliados: 19 controles** numa gaveta recolhível. Cortes novos: idade,
  teto de custo anual, só com garantia, só com histórico confiável, só o que revende fácil,
  só câmbio de baixo risco. Contador de filtros ativos no botão.
- **Campeão no topo com o porquê**, gerado das notas reais do carro em uma frase.
- **Números explicados onde são lidos**, em dois blocos com um parágrafo cada, em vez de chave solta.
- **Rolagem de storytelling**: gráfico fixo com texto em três etapas na seção da curva, revelações,
  parallax no herói, barra de progresso.
- **Gráficos com título que conclui e subtítulo que ensina a ler.**

## Como validar responsivo neste ambiente
O painel de navegador reporta `clientWidth: 0` e ignora `resize_window`, então medição direta mente.
**A solução é `mobile.html`**, que carrega o painel em três iframes de 390, 360 e 768. Media query
responde à largura do iframe, então a medição é real. Lembrar de forçar recarga com `?v=Date.now()`,
senão o iframe serve cache.

Resultado medido: zero rolagem horizontal em 360, 390 e 768. Matriz vira lista abaixo de 700px,
tabela cai para 5 colunas abaixo de 760px. Altura da página no celular caiu de **31.911 para 18.072px**
depois de limitar matriz a 10 modelos e tabela a 20 linhas, com botão para ver o resto.

## Bugs corrigidos nesta sessão
- `drawCurva` indexava `pts[12]` assumindo 13 pontos, mas a curva passou a começar na idade mínima
  observada. Modelo com ano mais novo anterior a 2026 estourava e **quebrava o render inteiro em silêncio**:
  cartões atualizavam, contagem e tabela não. Pesquisar "civic" disparava.
- Quatro arquivos de gráfico ainda pediam tokens do mundo antigo (`--surf`, `--ink3`, `--line2`),
  que resolviam para vazio.
- Tinta da matriz vinha de limiar fixo de índice, o que inverte errado entre temas.
  Agora é calculada pela luminância real do degrau.
- Branco sobre `#2997FF` reprovava em contraste no escuro (3,02). Criado o token `--acc-on`.
- Barra de progresso animava `width`. Passou para `transform: scaleX`.
- Risco do título atravessava a palavra seguinte (`position:relative` em elemento inline).
- Alvos de toque abaixo de 40px, agora 44px em `pointer: coarse`.

## Ainda em aberto
- Revisão final foi feita em contexto único, não pelo subagente `impeccable-finish-reviewer`.
  Os subagentes travaram por limite de taxa mais cedo nesta sessão.
- Geração de comps de imagem foi pulada por orçamento.
- Sem estado na URL: não dá para compartilhar uma visão já filtrada.
- Agrupamento heurístico erra em nomes compostos fora dos modelos de volume.

## Achado: a rodagem inverte o campeão

O ponto de virada fica entre **5.000 e 6.000 km por ano** (IPVA 2%, 5 anos de posse):

| km/ano | campeão | custo | VW Gol 2022 |
|---|---|---|---|
| 4.000 | VW Gol 2022 | 9.052 | 1º |
| 5.000 | VW Gol 2022 | 9.905 | 1º |
| 6.000 | Caoa Chery iCar Elétrico | 10.494 | 2º |
| 12.000 | Caoa Chery iCar Elétrico | 11.861 | 14º |
| 30.000 | Caoa Chery iCar Elétrico | 15.585 | 87º |

Por quê: a 5.000 km o Gol gasta R$ 2.696 de gasolina contra R$ 665 de energia do elétrico.
Essa diferença de R$ 2.031 não cobre o que o elétrico paga a mais em depreciação, seguro e
provisão de bateria. Acima disso o combustível vira o item dominante e o elétrico dispara.

Isso significa que **o controle de rodagem é o filtro que mais muda a resposta**, e hoje ele
está enterrado na gaveta sob "Premissas estimadas". Vale considerar promovê-lo.
