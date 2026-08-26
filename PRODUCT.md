# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primário: Joceli, comprando um carro para si. Brasileiro, mora no Brasil, decide em reais. Quer câmbio automático, uso misto de cidade e estrada, e uma faixa inicial de R$ 50 a 120 mil. Não definiu por quanto tempo pretende ficar com o carro, então o painel calcula em vários horizontes em vez de assumir um.

Secundário, confirmado: quem receber o link. O painel será compartilhado aberto, para pessoas que não acompanharam a construção e não conhecem as premissas. Isso torna método e ressalvas parte do produto, e não nota de rodapé.

Situação de uso: alguém pesquisando uma compra real, comparando anúncios, com acesso a preço de tabela mas sem visão do que o carro custa depois de comprado.

## Product Purpose

Responder qual carro automático vale mais a pena comprar agora, trocando "quanto custa na vitrine" por "quanto custa por ano de posse".

Soma cinco componentes que normalmente ninguém junta: depreciação medida na própria Tabela FIPE, IPVA, seguro, manutenção e energia. Sucesso é o usuário mudar de candidato, ou mudar de ano modelo, por causa de um número que ele não tinha antes.

## Positioning

Consulta de FIPE existe em qualquer lugar. O que não existe pronto é a **curva de depreciação medida versão por versão em todo o universo da tabela**, limpa do viés de renomeação de versão, somada ao custo de manter o carro.

Dois mecanismos sustentam isso e um concorrente não copia sem refazer o trabalho:

1. **Índice encadeado matched-model.** A FIPE renomeia as versões a cada geração, então a mediana crua de um ano não é comparável com a do ano seguinte. A variação ano a ano sai só das versões presentes nos dois anos.
2. **Varredura completa, não lista curta.** Todas as marcas, todas as versões automáticas, coletadas uma a uma porque a FIPE não publica planilha.

## Operating Context

- A FIPE **não** publica CSV nem dump. Só consulta versão por versão. Dumps públicos no GitHub estão parados em 2018 e a exportação comercial custa por volta de R$ 10 mil. A coleta por API é obrigatória, não preferência.
- A API oficial `veiculos.fipe.org.br` estrangula o rate limit progressivamente, de ~1 req/s até ~0,05 req/s. `parallelum.com.br` serve de segunda fonte, usa os mesmos códigos de marca e modelo, e é muito mais rápida. A coleta híbrida das duas é o caminho.
- A tabela de referência vira todo mês. Como o painel é ferramenta viva, o mês de referência é dado visível e não decoração.
- Todo o cache de respostas fica em `cache2/`. Reconstruir o dataset com `rebuild.py` lendo o cache, e nunca confiar no que uma execução interrompida conseguiu salvar.

## Capabilities and Constraints

- Universo atual: 54 marcas, 574 modelos, 1.782 versões automáticas, 5.009 pontos de preço, referência agosto/2026.
- Ficam de fora apenas Alfa Romeo, Daewoo, Mazda e MG, que não têm nenhum ano modelo a partir de 2016.
- Recorte de anos: 2016 em diante. Ano modelo futuro é 0 km e sai da conta.
- Separação obrigatória por energia: flex, híbrido, elétrico e diesel viram linhas distintas, porque misturam preço e custo de energia incompatíveis.
- Agrupamento em modelos: 59 famílias conferidas a mão, o resto por regra automática sobre o nome da versão. A regra erra em nomes compostos fora dos modelos de volume.
- Porte é conferido a mão nos modelos de volume e estimado nos demais.
- Recalculo é todo no cliente. Nenhuma chamada de rede em tempo de uso.

## Brand Commitments

**Preferência permanente de estética: o cânone big tech, com Apple e Airbnb como régua de qualidade.**
Registrada em 23/08/2026, depois de duas direções autorais construídas e recusadas (dashboard escuro com
acento teal, e classificados de jornal com cartela de para-brisa). O autor pediu explicitamente o caminho
convencional. Trabalho futuro executa a convenção em fidelidade máxima e não reabre a discussão de mundo
visual sem ele pedir.

Restrição de escrita confirmada: sem travessão e sem ponto e vírgula em qualquer texto do produto.

Não há logo, nome herdado ou ativo de marca a preservar.

## Evidence on Hand

Real, com caminho:

- `fipe_all.json`: 5.187 preços coletados da API oficial e da Parallelum.
- `cache2/`: mais de 7.400 respostas cruas de API, que permitem reconstruir tudo sem rede.
- `dados.json`: dataset final consumido pelo painel.
- `RETOMAR.md`: estado da coleta, decisões de método e armadilhas conhecidas.

Achados medidos, não opinião:

- Retenção mediana de mercado: 100% no zero, 93% em 1 ano, 87% em 2, 80% em 3, e 12 anos para valer metade.
- A queda é constante, perto de 6% ao ano. **Não existe joelho na curva.** O tombo famoso acontece entre o preço de concessionária e a FIPE, fora desta série.
- Escolher o modelo pesa cerca de 4x mais que escolher o ano. A mediana do custo anual varia 28% entre idades, e dentro da mesma idade a distância entre modelos passa de 110%.

Ausências que nenhum trabalho futuro pode preencher com invenção:

- Não há dado de confiabilidade, recall ou custo de oficina de fonte primária. Manutenção, seguro, consumo, liquidez e risco de câmbio são **estimativas de mercado**, não medição.
- Não há preço de anúncio real, só referência FIPE. Negociação, cor, quilometragem e estado mexem uns 10% para cada lado.
- Não há histórico suficiente para medir depreciação das marcas chinesas recentes. Onde falta, a curva é do mercado e vem marcada como estimada.

## Product Principles

1. **Preço de tabela não é custo.** A unidade de comparação do produto é reais por ano de posse, nunca o valor de vitrine.
2. **Dado medido e premissa minha nunca se misturam.** O que vem da FIPE e o que eu estimei ficam visualmente separados, sempre.
3. **Toda premissa é ajustável.** O usuário testa a conta em vez de engolir um número fechado. Se uma premissa não pode ser mexida, ela precisa de justificativa forte.
4. **Cobertura completa, sem lista curta.** O recorte é o universo inteiro da FIPE. Filtrar é escolha do usuário, não minha.
5. **A resposta é condicional e o produto tem que mostrar isso.** Visitantes liam o carro do herói
   como "o melhor carro". Nenhuma tela pode apresentar um vencedor sem as condições que o elegeram
   ao lado, e o contraste que mostra a troca precisa vir de uma varredura real, nunca de um exemplo
   escrito à mão.
6. **O produto envelhece em público.** Mês de referência e limitações são elemento de primeira classe, porque o link circula sem mim junto para explicar.

## Accessibility & Inclusion

Nenhum requisito específico de usuário foi estabelecido. Por ser compartilhado aberto, valem os padrões gerais: contraste suficiente, foco visível no teclado, tabelas e gráficos largos com rolagem própria, e nenhuma informação carregada só por cor.
