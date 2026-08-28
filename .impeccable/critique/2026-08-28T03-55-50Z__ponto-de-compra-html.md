---
target: ponto-de-compra.html
total_score: 32
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
timestamp: 2026-08-28T03-55-50Z
slug: ponto-de-compra-html
---
⚠️ DEGRADED: single-context (o subagente da Assessment A morreu no limite de sessão antes de rodar, então a revisão de design foi feita no contexto principal. A Assessment B rodou isolada e completa.)

## Design Health Score

| # | Heurística | Nota | Achado |
|---|---|---|---|
| 1 | Visibilidade do estado | 3 | Progresso, contadores e a fita de condições são fortes, mas o texto do veredito descreve uma ponderação que o visitante não escolheu. |
| 2 | Correspondência com o mundo real | 3 | Linguagem excelente ("a média brasileira", "trabalho com o carro"), porém "estimado pelo Ponto de Compra" se autorreferencia antes do visitante saber que esse é o nome do site. |
| 3 | Controle e liberdade | 4 | Voltar, Refazer, Pular, chips editáveis e todas as premissas ajustáveis. |
| 4 | Consistência e padrões | 2 | Modo quirks em produção, sem doctype e sem lang. "Responda três coisas" contra "Pergunta 1 de 4". |
| 5 | Prevenção de erro | 3 | Difícil errar, faixas em select. O estado vazio existe mas manda para o lugar errado. |
| 6 | Reconhecer em vez de lembrar | 3 | Chips de resumo e fita mantêm as respostas à vista. No celular não há navegação de seção numa página de 13.000px. |
| 7 | Flexibilidade e eficiência | 4 | Presets mais sliders manuais, busca, tabela ordenável, atalho de pular. |
| 8 | Estético e minimalista | 4 | Uma pergunta por vez, contenção real, nada decorativo disputando com número. |
| 9 | Recuperação de erro | 2 | Único estado vazio aponta "no topo" para um controle que mora na gaveta. |
| 10 | Ajuda e documentação | 4 | Seção de método, balões por número e fonte declarada por critério. |
| **Total** | | **32/40** | **Bom, com defeitos estruturais** |

## Design Specificity Verdict

**Autoral para este produto, não intercambiável.** Três coisas não sairiam de um template: a fita que repete as condições respondidas em cima do vencedor, o card que procura a virada real varrendo perfis alternativos, e a separação visual permanente entre número medido e número estimado. O jogo de quatro perguntas é a forma que o argumento do produto exige, não enfeite.

**Varredura determinística**: zero achados. O agente validou que não é falso silêncio com dois controles, incluindo injetar uma regra dentro do CSS embutido do próprio arquivo montado, que disparou corretamente. Zero significa "nada do que este detector testa", não "nada existe".

## Overall Impression

O texto e a explicação estão num nível raro. Cada gráfico conclui em vez de só mostrar, cada estimativa diz de onde vem. O que quebra não é o design, é a fundação: a página roda em modo quirks e não declara idioma.

A maior oportunidade é que **em nenhum momento da primeira tela a página diz o que ela faz**. "Não existe melhor carro" abre dizendo o que ela não é.

## What's Working

1. **Cada gráfico tem uma conclusão no título.** "Carro não despenca e depois estabiliza. Ele cai sempre igual." O visitante recebe o achado e depois a prova.
2. **A proveniência é estrutural.** Medido na FIPE e estimado aqui nunca se misturam, e o selo "Histórico curto" aparece sozinho na BYD.
3. **A linguagem das opções é de gente.** "12 mil km, a média brasileira" e "Vale o chute" derrubam a barreira de quem não sabe responder.

## Priority Issues

**[P0] A página roda em modo quirks e não declara idioma.**
`build.py` monta o documento a partir de `part1.html`, que começa em `<meta charset>`. Sem doctype, `document.compatMode` é `BackCompat` na produção. Sem `<html lang="pt-BR">`, leitor de tela lê português com voz inglesa e o navegador não oferece tradução.
Fix: emitir `<!doctype html><html lang="pt-BR">` no build.
Comando: /impeccable harden

**[P1] O texto contradiz o produto em três lugares.**
"Responda três coisas" com quatro perguntas. "Os três que lideram no seu filtro" para quem respondeu perguntas e não filtrou nada. E o parágrafo do veredito lista a ponderação equilibrada mesmo quando o visitante escolheu outra prioridade.
Fix: contar as perguntas dinamicamente, trocar "filtro" por "no que você respondeu", e montar a lista de critérios a partir do perfil ativo.
Comando: /impeccable clarify

**[P1] A gaveta fechada engole o teclado.**
Ela é escondida só por `transform`, sem `inert`. São 104 controles invisíveis antes do conteúdo, e o foco não volta ao botão de filtros ao fechar.
Fix: `inert` na gaveta fechada e devolver o foco no fechamento.
Comando: /impeccable harden

**[P1] Nenhuma navegação de seção abaixo de 1040px.**
O menu do topo some e o botão de seções foi removido. Restam 13.000px de rolagem sem índice no celular.
Fix: barra de progresso com marcadores clicáveis ou um índice ancorado.
Comando: /impeccable adapt

**[P2] Contraste reprovado na barra de pesos e alvos pequenos.**
Texto branco fixo sobre teal, azul e roxo entre 3,71 e 3,84 no escuro. Botões de ajuda em 17x17. Cinco gráficos com `role="img"` sem nome acessível.
Comando: /impeccable audit

## Persona Red Flags

**Jordan, caiu aqui pelo WhatsApp**: o link chega sem prévia, sem descrição e sem imagem, porque não há `meta description` nem Open Graph. A aba diz só "Ponto de Compra". Na primeira tela lê "Não existe melhor carro" e ainda não sabe se o site vende, compara ou ensina. Vê "estimado pelo Ponto de Compra" e não sabe quem é isso.

**Alex, teclado e leitor de tela**: atravessa 104 controles invisíveis antes do conteúdo. Chega nos cinco gráficos e ouve cinco nós mudos.

## Minor Observations

- "Toque em qualquer uma" e "Toque nos nomes" no desktop.
- Busca sem placeholder e escondida na gaveta.
- `PRODUCT.md` guarda 110% e 28% onde a página calcula 559% e 16%.

## Questions to Consider

- Se a primeira linha dissesse o que o site faz em vez do que ele nega, o jogo perderia força ou ganharia?
- O critério "não dar dor de cabeça" está medindo risco de câmbio quando a pessoa pergunta risco de marca. Deveria mudar de nome ou de conteúdo?
