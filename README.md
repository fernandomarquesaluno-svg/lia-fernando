# Portal acadêmico — Laboratório de Inteligência Artificial

Portal web multipágina, responsivo e interativo, inspirado no Atlas de Evidências. Cada entrega acadêmica possui sua própria página, publicada **dentro de um único repositório e site GitHub Pages**.

**Site:** https://fernandomarquesaluno-svg.github.io/lia-fernando/

## Organização principal

| Caminho | Conteúdo |
| --- | --- |
| `/index.html` | Entrada do projeto e caracterização do corpus bibliográfico |
| `/contexto.html` | Contexto, problema, pergunta e objetivos |
| `/metodologia.html` | Métodos da investigação |
| `/trabalhos.html` | Índice das entregas |
| `/atividades/levantamento/` | Trabalho 01 — revisão narrativa |
| `/atividades/atlas/` | Trabalho 02 — Atlas científico interativo |
| `/atividades/kallstenius/` | Trabalho 03 — análise científica de Kallstenius et al. (2026) |
| `/atividades/deproberta/` | Trabalho 04 — análise e apresentação interativa do DepRoBERTa (ACL 2022) |
| `/atividades/experimentos/` | Trabalho 05 — proposta de experimento com LLMs |
| `/evolucao.html` | Diário de evolução e decisões |

As antigas rotas `/atlas.html`, `/levantamento.html`, `/kallstenius.html` e `/experimentos.html` redirecionam às respectivas páginas da pasta `/atividades/`.

## Melhorias sugeridas pelo professor — 13/11/2026

1. **Sem apresentação em slides:** as atividades são publicadas e discutidas como páginas HTML dinâmicas.
2. **Fluxograma interativo:** clicar em uma categoria de método ou tarefa (ex.: depressão) realça todas as suas ligações e exibe a lista completa de trabalhos correspondentes; a seleção pode ser enviada às fichas.
3. **Comparador com pontuação ponderada:** o usuário seleciona características (natureza empírica, idioma, modelos, disponibilidade dos dados, condições, fonte textual e outros), atribui pesos de 0 a 5 e ordena as 33 referências por **aderência aos critérios**, de 0 a 100.
4. **Um site para todas as atividades:** cada entrega tem diretório próprio sob `/atividades/`, com publicação incremental.
5. **Natureza da literatura:** conforme o inventário auditado de 33 referências, são 25 pesquisas empíricas (75,8%), 3 recursos/datasets e 5 sínteses ou revisões.

### Nota sobre o comparador

A aderência é `100 × peso atendido / peso avaliável`. A cobertura é a fração `peso avaliável / peso selecionado`. Um critério sem confirmação fica fora do peso avaliável. Uma incompatibilidade documentada vale zero e permanece no denominador. Peso zero desativa o critério. Em empates, vem primeiro a maior cobertura e depois o menor ID. Uma referência sem critérios avaliáveis fica sem pontuação.

Os perfis prontos usam pesos 5 (estudo empírico), 4 (LLMs ou Transformers) e 3 (PT-BR). Com LLMs, as fichas #7 e #13 lideram com 12/12. Com Transformers, as fichas #8 e #19 lideram com 12/12. A pontuação descreve preferências de consulta. As fichas documentam as métricas e seus protocolos.

O comparador lado a lado dos dois estudos permanece disponível. A matriz técnica e o JSON foram copiados para este repositório, enquanto o Atlas original segue preservado em [depression_poject](https://github.com/fernandomarquesaluno-svg/depression_poject).

## Estado acadêmico

- Revisão bibliográfica: narrativa, não sistemática PRISMA.
- Estudos distintos podem compartilhar corpus e unidade amostral.
- Rótulos de comunidades ou autorrelatos não são diagnósticos clínicos.
- Estudo DepRoBERTa: **análise didática concluída** (dados, método, métricas, modo apresentação); **reprodução ainda não realizada**.
- Experimento próprio com LLMs: **planejado**, sem resultados produzidos; seleção do artigo-base e corpus pendente.
- Estudo analisado: Kallstenius et al. (2026), *JMIR Mental Health*, DOI [10.2196/98925](https://doi.org/10.2196/98925).

## Execução

Execute `python3 -m http.server 8000` na raiz e acesse `http://localhost:8000/`. O site é estático e mantém os caminhos relativos usados no GitHub Pages.

A base de consulta é `atividades/atlas/estudos.json`. O Atlas mantém uma cópia embutida para abertura do acervo sem requisição adicional e uma matriz HTML para leitura sem JavaScript. O teste de integridade confere as duas cópias JSON. `ranking.js` contém a lógica de pontuação, `ranking-ui.js` conecta os controles da página e `resultados.js` calcula as distribuições da página inicial e do Atlas.

```sh
node --test tests/atlas.test.cjs
npm install --prefix /tmp/lia-atlas-tests jsdom@26.1.0 --no-audit --no-fund
NODE_PATH=/tmp/lia-atlas-tests/node_modules node --test tests/*.test.cjs
```

Veja o [relatório de consolidação e validação](docs/consolidacao-atlas.md).

## Preservação

- `backup-antes-recomendacoes-2026-11-13`: estado deste portal antes das melhorias do professor.
- `backup-portal-2026-11-13`: estado anterior da primeira revisão visual.
- `backup-atlas-2026-11-13`: backup do Atlas no repositório original.

**Autor:** Fernando Henrique de Souza Marques.
