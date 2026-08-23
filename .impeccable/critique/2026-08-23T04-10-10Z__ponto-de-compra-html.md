---
target: ponto-de-compra.html
total_score: 30
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-23T04-10-10Z
slug: ponto-de-compra-html
---
# ⚠️ DEGRADED: single-context (subagentes A e B travaram por limite de taxa após ~9 min sem produzir resultado; encerrados e reexecutados no contexto pai)

Declaração adicional: o `detect.mjs` já havia rodado uma vez para montar o menu de roteamento, então a síntese não estava cega à saída determinística.

## Design Health Score

| # | Heurística | Nota | Questão central |
|---|---|---|---|
| 1 | Visibilidade do status | 3 | Filtro ecoado e contagens vivas, mas nada comunica a idade do dado numa ferramenta viva |
| 2 | Correspondência com o mundo real | 4 | Linguagem do comprador, não do sistema |
| 3 | Controle e liberdade | 3 | Clicar na matriz joga para outra seção sem caminho de volta |
| 4 | Consistência e padrões | 3 | `<th>` de ordenação age como botão sem ser um |
| 5 | Prevenção de erro | 3 | Sliders se travam mutuamente, busca vazia tratada |
| 6 | Reconhecer em vez de lembrar | 2 | Siglas dos critérios nos cards exigem memorizar painel que está abaixo |
| 7 | Flexibilidade e eficiência | 3 | Sem estado na URL, não dá para compartilhar visão filtrada |
| 8 | Estética e minimalismo | 3 | 9 seções e 11 controles simultâneos; seção 04 repete a 03 |
| 9 | Recuperação de erro | 3 | Estados vazios bem escritos |
| 10 | Ajuda e documentação | 3 | Metodologia densa e honesta, mas no rodapé e sem links de entrada |
| **Total** | | **30/40** | Sólido, com vão real entre promessa e codificação |

## Design Specificity Verdict

Meio-termo puxando para o específico. Autoral: curva de retenção com meia-vida, box plot de custo por idade que carrega a tese numa imagem, matriz preço x ano com dois números por célula. Paleta petrol-teal com IBM Plex Mono ancorada em instrumento de precificação. Intercambiável: gramática de card, tile, seção numerada e rail fixo. Numeração 01-09 impõe sequência numa superfície escaneada.

Detector: 1 achado, `side-tab` linha 219, `border-left:3px solid var(--warm)` em `.note`. Verdadeiro positivo. Partes-fonte limpas.

Evidência de navegador: contraste zero falhas nos dois temas. 326 focáveis; 11 `<th>` de ordenação não focáveis (ordenação exclusiva de mouse); 279 botões da matriz na ordem de tabulação. Foco visível presente. `prefers-reduced-motion` presente. Render 35,6 ms, 5.190 nós, 1.034 SVG. Sem `meta viewport`. Responsivo ao vivo não verificável neste ambiente.

## Priority Issues

- **[P0] Separação entre dado medido e premissa não existe visualmente.** É o inegociável nº1 e o link circula sem o autor. `R$ 22.350/ano` (premissa) tem tratamento idêntico a `Preço FIPE R$ 108.913` (fato). Fix: tratamento visual persistente e explicação ancorada no ponto de leitura. → polish
- **[P1] Sem `meta viewport` num produto compartilhado aberto.** Celular renderiza a 980px e reduz tudo. → adapt
- **[P1] Ordenação da tabela é mouse-only e a matriz sequestra o Tab.** 11 `<th>` com onclick não focáveis; 279 células antes da tabela. Fix: botões reais com `aria-sort`, tirar células da ordem sequencial. → audit
- **[P2] Idade do dado não é elemento de primeira classe.** Ferramenta viva sem prazo, mês de referência em 11px. → polish
- **[P2] Onze controles simultâneos sem hierarquia.** Muito acima do limite de 4. Energia elétrica e bateria só importam com EV em cena. → layout
- **[P3] Borda de destaque lateral nas caixas de nota.** Tell de UI gerada por IA. → quieter

## Persona Red Flags

- **Quem recebe o link frio:** não sabe o que é FIPE nem o que "por ano de posse" inclui; primeiro número é a conclusão sem composição; siglas CUSTO/MANUT/GARAN não significam nada.
- **Jordan (primeira vez):** "AT6 Aisin", "e-CVT DM-i" assumem vocabulário de mecânica; painel de critérios abaixo dos cards que os usam.
- **Alex (avançado):** sem atalhos, sem estado na URL, ordenação exige mouse, pesos não salvam.

## Minor Observations

Seção 04 repete a 03. `#uFam` fácil de não notar. Numeração sugere ordem numa superfície de escaneio. Legenda do gráfico 02 lista 22 modelos apagados competindo com 4 ativos. `teste.html` está na pasta do entregável.

## Questions to Consider

Qual é o único número que importa? E se dado e estimativa tivessem tipografias diferentes o tempo inteiro? Nove seções é estrutura ou registro da investigação? Uma versão confiante começaria pelo veredicto ou pela curva que corrige a intuição?
