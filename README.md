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
| `/atividades/experimentos/` | Trabalho 04 — proposta de experimento com LLMs |
| `/evolucao.html` | Diário de evolução e decisões |

As antigas rotas `/atlas.html`, `/levantamento.html`, `/kallstenius.html` e `/experimentos.html` redirecionam às respectivas páginas da pasta `/atividades/`.

## Melhorias sugeridas pelo professor — 13/11/2026

1. **Sem apresentação em slides:** as atividades são publicadas e discutidas como páginas HTML dinâmicas.
2. **Fluxograma interativo:** clicar em uma categoria de método ou tarefa (ex.: depressão) realça todas as suas ligações e exibe a lista completa de trabalhos correspondentes; a seleção pode ser enviada às fichas.
3. **Comparador com pontuação ponderada:** o usuário seleciona características (natureza empírica, idioma, modelos, disponibilidade dos dados, condições, fonte textual e outros), atribui pesos de 1 a 5 e ordena as 33 referências por **aderência aos critérios**, de 0 a 100.
4. **Um site para todas as atividades:** cada entrega tem diretório próprio sob `/atividades/`, com publicação incremental.
5. **Natureza da literatura:** conforme o inventário auditado de 33 referências, são 25 pesquisas empíricas (75,8%), 3 recursos/datasets e 5 sínteses ou revisões.

### Nota sobre o comparador

A pontuação é `100 × (soma dos pesos das características atendidas) / (soma dos pesos selecionados)`. **Não mede** precisão, F1, desempenho, qualidade científica nem validade clínica. A falta de confirmação de um campo não comprova ausência da característica. Em caso de empate no escore, a ordem segue o identificador bibliográfico.

O comparador lado a lado dos dois estudos permanece disponível. A matriz técnica e o JSON foram copiados para este repositório, enquanto o Atlas original segue preservado em [depression_poject](https://github.com/fernandomarquesaluno-svg/depression_poject).

## Estado acadêmico

- Revisão bibliográfica: narrativa, não sistemática PRISMA.
- Estudos distintos podem compartilhar corpus e unidade amostral.
- Rótulos de comunidades ou autorrelatos não são diagnósticos clínicos.
- Experimento próprio com LLMs: **planejado**, sem resultados produzidos; seleção do artigo-base e corpus pendente.
- Estudo analisado: Kallstenius et al. (2026), *JMIR Mental Health*, DOI [10.2196/98925](https://doi.org/10.2196/98925).

## Execução

Abra `index.html` no navegador ou execute `python3 -m http.server 8000` na raiz do projeto. O site é estático, sem etapa de build. Publique via **Settings → Pages → Deploy from a branch → main / (root)**.

## Preservação

- `backup-antes-recomendacoes-2026-11-13`: estado deste portal antes das melhorias do professor.
- `backup-portal-2026-11-13`: estado anterior da primeira revisão visual.
- `backup-atlas-2026-11-13`: backup do Atlas no repositório original.

**Autor:** Fernando Henrique de Souza Marques.
