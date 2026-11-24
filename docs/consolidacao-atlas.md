# Consolidação e validação do Atlas de Evidências

Auditoria em 24 de novembro de 2026. Base do trabalho: `af76212` em `main`. A branch incorpora a atualização do vídeo publicada durante a auditoria.

## A. Estado inicial e final

O portal já tinha sete páginas principais, rotas de compatibilidade e cinco páginas de atividades. O Atlas já organizava 33 referências em fichas com detalhes sob demanda, matriz de leitura, mapa método–tarefa, ranking ponderado, comparação lado a lado e auditoria de dados. A página inicial apresentava o portal e os estudos de caso. O histórico identificava entregas e a retrospectiva do semestre. O título, a pergunta e o acesso à ferramenta estavam dispersos, e o ranking tratava informação inconclusiva como zero no denominador integral.

A implementação desta branch coloca o Atlas no primeiro acesso e traz o mapa, o comparador e os resultados para o início da rota de consulta. A interface oferece seleção de categoria fora do SVG, controle de ampliação e acesso direto às fichas, enquanto o ranking mostra cobertura e cálculo por critério. O acervo original, sua matriz e as demais atividades continuam disponíveis.

## B. Requisitos da disciplina

| Requisito | Situação inicial | Situação na branch | Evidência | Pendência |
| --- | --- | --- | --- | --- |
| Contexto | Em página específica e na apresentação | Resumido na entrada com link para detalhes | [Entrada](../index.html) | — |
| Problema | Explicado no contexto | Destacado na entrada junto à pergunta | [Entrada](../index.html) | — |
| Proposta de solução | Documentada em conteúdo distribuído | Atlas e suas ferramentas descritos e acessíveis diretamente | [Entrada](../index.html) | — |
| Evolução e andamento | Diário com filtro e retrospectiva | Inclui o vídeo e a consolidação desta branch como marcos | [Diário](../evolucao.html) e I03 | — |
| Interface adequada à apresentação | Identidade visual e rota guiada já disponíveis | Hierarquia, controles, indicadores, foco e movimento reduzido revisados no código | [Atlas](../atividades/atlas/index.html) e I01–I03 | Conferir o acabamento em navegador nas três resoluções |
| Suporte à apresentação acadêmica | Apresentação guiada separada | Acesso direto a demonstrações, vídeo e dados | [Entrada](../index.html) e [apresentação](../apresentacao.html) | Revisão pelo autor |

## C. Sugestões do professor

| Sugestão | Alteração | Evidência | Status |
| --- | --- | --- | --- |
| Entrada em endereço curto | A raiz passa a abrir com o Atlas, a síntese e os atalhos | [Entrada](../index.html) | Implementada na branch |
| Pergunta e resultados próprios | Pergunta orientadora no primeiro bloco e resultados descritivos do acervo | [Entrada](../index.html) e [resultados](../atividades/atlas/index.html#resultados) | Implementada na branch |
| Dar protagonismo ao mapa e ao comparador | Antecipação das ferramentas, configuração avançada recolhida e manutenção das fichas sob demanda | I02 e [Atlas](../atividades/atlas/index.html) | Implementada na branch |
| Vídeo narrado e legendado | DepRoBERTa disponível no estudo de caso. O demonstrativo geral foi reservado para etapa futura | [Player publicado](https://fernandomarquesaluno-svg.github.io/lia-fernando/atividades/deproberta/#video) | DepRoBERTa verificado. Demonstrativo geral pendente |

O material originalmente descrito no feedback passa a ser apresentado como artefato de análise da literatura. O plano experimental segue registrado como atividade complementar planejada.

## D. Resultados científicos e técnicos

- **Levantamento.** 33 referências: 25 estudos empíricos, 3 recursos e 5 sínteses. Idioma dos textos conforme a ficha: 14 inglês, 8 PT-BR, 8 diversos ou não informados, 2 mistos e 1 coreano. A distribuição anual é 2020 (1), 2022 (2), 2023 (1), 2024 (6), 2025 (13) e 2026 (10).
- **Rede.** 16 combinações entre métodos e tarefas e 36 incidências estudo–método. O denominador das distribuições de método e de tarefa é de 25 estudos empíricos. Uma publicação pode utilizar múltiplas abordagens. A tarefa Depressão reúne 16 estudos empíricos e seis conexões a famílias técnicas.
- **Disponibilidade.** O catálogo registra acesso parcial em 10 referências, controlado em 7, público em 5, restrito em 3, sem confirmação em 3 e sem corpus próprio em 5. As fichas #19, #20 e #31 têm pendências sinalizadas sobre outras dimensões técnicas. As contagens são por publicação. A reutilização de corpora permanece documentada nas fichas.
- **Achados.** A seção de síntese remete a #3 e #6 para rotulagem, #6 e #8 para fontes em português, #2 e #15 para diferenças de método e protocolo, e #1 e #32 para generalização. Os valores de F1 e outras métricas permanecem atribuídos às publicações originais.
- **Exemplos reproduzíveis.** Em ambos os perfis, natureza empírica pesa 5, idioma PT-BR pesa 3 e o método pesa 4. LLMs coloca #7 (Nagamatu e Paraboni) e #13 (Viduani et al.) nas duas primeiras posições. Ao trocar o método por Transformers, #8 (Mendes e Caseli) e #19 (Herculano et al.) passam ao topo. A ficha #7 passa de 12/12 a 8/12. A ficha #8 faz o caminho inverso. Em ambos os casos a cobertura é 12/12.
- **Cobertura no comparador.** Em um perfil com acesso público (4) e PT-BR (1), a ficha #19 tem 1/1 avaliável de 5 selecionados e a #8 tem 1/5 avaliável de 5 selecionados. Isso evidencia a necessidade de ler cobertura junto à aderência.
- **Código.** As páginas `index.html`, `metodologia.html`, `evolucao.html` e `atividades/atlas/index.html` receberam ajustes. A lógica do ranking, o controle de interface e as distribuições estão em `ranking.js`, `ranking-ui.js` e `resultados.js`; os estilos complementares estão em `assets/atlas-consolidacao.css`. O arquivo de dados, a matriz, os atalhos legados e a pasta do DepRoBERTa têm diff vazio em relação à base.

## E. Testes

| ID | Procedimento e esperado | Observado | Status |
| --- | --- | --- | --- |
| D01 | Comparar a base JSON com o acervo embutido. Conferir 33 IDs e URLs únicos e recalcular o mapa | As duas bases são iguais. 33 referências, 25 empíricas, 16 combinações e 36 incidências | Aprovado |
| R01 | Variar pesos, remover critério e enviar catálogo e seleção vazios | Ficha #7: 50%, 80%, 100% e 0%, conforme os pesos. Seleções sem peso e catálogos vazios retornaram lista vazia | Aprovado |
| R02 | Exercitar acesso incompatível e inconclusivo, incluindo ausência de peso avaliável | #19: 1/1 com 1/5 de cobertura. #8: 1/5 com 5/5 de cobertura. Acesso desconhecido como critério único deixa a ficha sem nota | Aprovado |
| R03 | Rodar os dois perfis, verificar desempate e inverter a ordem de entrada do catálogo | Perfis liderados por #7 e #13 ou por #8 e #19. Empates foram estáveis por cobertura e ID | Aprovado |
| I01 | Executar scripts e verificar entrada, pergunta, rotas e contagens no DOM | Os quatro totais esperados foram renderizados, com acessos diretos e sem erro de script | Aprovado |
| I02 | Operar mapa com teclado, abrir ficha, filtrar, limpar, ampliar, usar os dois perfis, selecionar par e mudar o gráfico | 16 fichas para Depressão, 6 conexões destacadas, filtro combinado 1/33, estado sem resultado 0/33, zoom 1,25, comparação #7/#20 e gráfico de métodos com 14 Transformers em 25 estudos | Aprovado |
| I03 | Conferir rotas e âncoras das páginas alteradas, aplicar e limpar filtro do diário | Rotas e âncoras locais verificadas. Vídeo aparece na categoria Site. Filtro Todos repõe os marcos | Aprovado |
| V01 | Reproduzir o vídeo publicado e comparar o MP4 com a cópia da branch | Chrome exibiu controles e avanço até 3,29 s de 89,4 s. MP4 publicado e da branch com SHA-256 igual, `c0fc8e2dfe35762fdcdc01c0ef77561390a5fe62f6d89e169903c593dcd23b4e` | Aprovado |
| F01 | Tentar abrir as 33 URLs primárias | 15 retornaram HTTP 2xx no terminal. Mais uma, SetembroBR, foi confirmada na editora. Nos demais casos houve bloqueio, redirecionamento sem conclusão ou timeout | Parcial |
| U01 | Inspecionar layout, contraste, área rolável, sobreposições e vídeo em desktop, tablet e celular | O Chromium local falhou ao iniciar por restrição de soquetes do ambiente. O navegador remoto abriu o vídeo publicado e bloqueou a abertura de arquivos locais. Os testes DOM não medem geometria, contraste ou scroll físico | Não executado na versão alterada |
| U02 | Registrar capturas antes e depois da interface | A comparação visual depende da inspeção da versão alterada em navegador | Não executado |

Os sete testes automatizados aprovados estão em [tests](../tests/). O primeiro teste de integridade tinha uma expectativa incorreta de 19 combinações. Uma recontagem independente por par método–tarefa confirmou 16, e o teste foi corrigido e reexecutado. O [README](../README.md) registra os comandos para repetir a validação.

## F. Evidências

- Histórico da publicação do vídeo no [commit de inclusão](https://github.com/fernandomarquesaluno-svg/lia-fernando/commit/767463a) e na [atualização animada](https://github.com/fernandomarquesaluno-svg/lia-fernando/commit/af76212).
- Pesquisa, mapa, comparador e exemplos em [Atlas](../atividades/atlas/index.html). Instruções de execução em [README](../README.md).
- O histórico do PR reúne os commits de implementação e validação. A comparação visual antes/depois permanece pendente.

## G. Pendências

- **Antes da entrega definitiva.** Revisar o PR, verificar a interface em desktop, tablet e smartphone e conferir a versão publicada após aprovação.
- **Dependências do autor.** Completar consultas, datas e regras de seleção do levantamento, se houver registros. As fichas já indicam os campos técnicos pendentes.
- **Fontes externas.** Acesso a parte das publicações ficou inconclusivo neste ambiente. Links existentes foram preservados.
- **Sugestão futura.** Produzir o vídeo demonstrativo geral do Atlas após a avaliação das melhorias.
- **Limite de escopo.** A proposta com LLMs permanece planejada e os números do Atlas são descritivos do acervo ou funcionais da ferramenta.

## H. Parecer

| Pergunta | Parecer |
| --- | --- |
| O conteúdo atende ao solicitado? | Contexto, problema, questão, solução e andamento estão na branch. |
| Quais sugestões foram atendidas? | Entrada na raiz, pergunta, resultados próprios e foco no mapa e no comparador. O vídeo do estudo complementar está publicado. |
| O comparador funciona? | Os cenários de cálculo, cobertura, desempate e interação passaram. |
| O mapa está funcional? | As conexões, seleção, encaminhamento para fichas e controle de zoom passaram no DOM. A movimentação visual no celular precisa ser verificada. |
| Os resultados são verificáveis? | Sim. As contagens vêm do catálogo preservado e foram conferidas por teste e recontagem. |
| A qualidade visual e técnica está validada? | A lógica e as interações principais passaram. O layout renderizado da branch segue sem validação nas três resoluções. |
| O vídeo foi preservado? | A pasta permaneceu idêntica à base e a reprodução publicada foi verificada. |
| Está pronto para apresentação? | O conteúdo está estruturado para revisão acadêmica. A apresentação final depende da revisão visual e da publicação após aprovação. |
| O que falta para a entrega? | Revisão do PR, conferência visual e publicação aprovada. O vídeo geral do Atlas é uma etapa separada. |
