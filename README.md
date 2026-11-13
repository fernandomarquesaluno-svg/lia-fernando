# Portal acadêmico — Laboratório de Inteligência Artificial

Site acadêmico responsivo, baseado na identidade visual do **Atlas de Evidências**, que reúne o contexto da pesquisa e páginas independentes para cada trabalho desenvolvido na disciplina.

**Site publicado:** https://fernandomarquesaluno-svg.github.io/lia-fernando/

## Organização

| Página | Objetivo |
| --- | --- |
| `index.html` | Página inicial e entrada do projeto |
| `contexto.html` | Contexto, problema, pergunta de pesquisa e objetivos |
| `metodologia.html` | Estratégia metodológica da pesquisa |
| `trabalhos.html` | Catálogo das entregas acadêmicas |
| `levantamento.html` | Página dedicada ao levantamento bibliográfico (2020–2026) |
| `atlas.html` | Página dedicada ao Atlas interativo de evidências |
| `kallstenius.html` | Página contínua de análise técnica do artigo de Kallstenius et al. (2026) |
| `experimentos.html` | Página da proposta experimental com LLMs, ainda em planejamento |
| `evolucao.html` | Diário cronológico de evolução e refinamentos |

## Experiência de navegação

- Todas as entregas são páginas HTML próprias: **não existe modo de slides ou apresentações em quadros**.
- A página do artigo reúne objetivo, dados, modelos, ensembles, protocolo, resultados, limitações e referência.
- O Atlas permanece incorporado do [projeto original](https://github.com/fernandomarquesaluno-svg/depression_poject), mantendo seus filtros e visualizações, além de um link para acesso direto.
- Responsividade, animações discretas, navegação por âncoras, menu móvel e respeito à preferência de movimento reduzido.
- Código estático em HTML, CSS e JavaScript, sem dependências de build.

## Rigor acadêmico

- Rótulos relacionados a depressão, ansiedade e estresse em conjuntos de textos **não equivalem a diagnósticos clínicos**.
- O levantamento é **narrativo**, não uma revisão sistemática PRISMA.
- As 33 referências incluem tipos distintos de publicação; não são necessariamente 33 experimentos independentes.
- A etapa experimental não tem resultados próprios ainda: o artigo-base e a base de dados serão definidos posteriormente.
- Artigo analisado: Kallstenius et al. (2026), *JMIR Mental Health*, DOI [10.2196/98925](https://doi.org/10.2196/98925).

## Execução e publicação

Abrir `index.html` no navegador ou executar:

```bash
python3 -m http.server 8000
```

Em **Settings → Pages**, escolha `Deploy from a branch`, branch `main`, pasta `/ (root)`.

## Preservação

- Branch `backup-portal-2026-11-13`: versão do portal anterior à revisão visual e estrutural.
- Branch `backup-atlas-2026-11-13` no projeto original: cópia de segurança do Atlas.

**Autor:** Fernando Henrique de Souza Marques.
