# Portal Acadêmico — Laboratório de Inteligência Artificial

Site acadêmico multipágina sobre **indicadores textuais de depressão, ansiedade e estresse**, desenvolvido para acompanhar a pesquisa ao longo do semestre e apoiar a apresentação final.

**Site publicado:** https://fernandomarquesaluno-svg.github.io/lia-fernando/

## Páginas

| Arquivo | Finalidade |
| --- | --- |
| `index.html` | Página inicial, destaques do Atlas e do artigo, roteiro da pesquisa |
| `contexto.html` | Contexto, problema, pergunta e objetivos |
| `metodologia.html` | Percurso metodológico e critérios de qualidade |
| `atlas.html` | Integração do Atlas científico original, com acesso alternativo |
| `kallstenius.html` | Análise e apresentação interativa de nove quadros do artigo de 2026 |
| `experimentos.html` | Proposta de experimento com LLMs, ainda em planejamento |
| `evolucao.html` | Linha do tempo das entregas, decisões e refinamentos |

## Funcionalidades

- Layout responsivo inspirado no Atlas, com fundo azul-escuro e acentos ciano/violeta.
- Animações de entrada, visualizações e barra de progresso de leitura, respeitando redução de movimento no navegador.
- Menu acessível para computador, tablet e celular.
- Navegação na apresentação técnica por botões ou setas do teclado quando o painel está em foco.
- **Modo apresentação em tela cheia** no artigo de Kallstenius: botão para abrir/fechar e tecla Esc para sair.
- Filtros na linha do tempo, indicação de estados e links para fontes.
- Site estático em HTML/CSS/JavaScript sem etapa de build.

## Fontes científicas e limites

O acervo científico original está em [depression_poject](https://github.com/fernandomarquesaluno-svg/depression_poject), com o [Atlas comparativo](https://fernandomarquesaluno-svg.github.io/depression_poject/tabelas/comparativo/). Este portal **incorpora** o Atlas; não substitui, duplica ou altera o conteúdo original.

A apresentação de **Kallstenius et al. (2026)** refere-se ao artigo *Ensemble of Domain-Specific Natural Language Processing and Large Language Models for Detecting Suicidal Ideation and Mental Health Conditions in Social Media Text: Development and Evaluation Study*, JMIR Mental Health, DOI [10.2196/98925](https://doi.org/10.2196/98925).

O site diferencia indicadores textuais de diagnóstico clínico, não trata resultados entre datasets como ranking e identifica a etapa experimental como *planejada*, sem inventar avaliações.

## Desenvolvimento local

Abra `index.html` diretamente ou, na raiz do repositório, execute:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000/`. As fontes do Google Fonts e o iframe do Atlas exigem acesso à internet.

## GitHub Pages

Em **Settings → Pages** escolha `Deploy from a branch`, branch `main`, pasta `/ (root)`. O arquivo `.nojekyll` mantém o site estático sem processamento do Jekyll.

## Preservação

- Backup do portal antes da revisão: branch `backup-portal-2026-11-13` neste repositório.
- Backup do projeto Atlas: branch `backup-atlas-2026-11-13` no repositório original.

**Autor:** Fernando Henrique de Souza Marques.
