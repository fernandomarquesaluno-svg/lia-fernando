# Portal acadêmico — Laboratório de Inteligência Artificial

Portal multipágina estático, responsivo e animado, inspirado na identidade visual do Atlas de Evidências.

## Páginas
- `index.html`: capa e navegação
- `contexto.html`: contexto, problema e objetivos
- `metodologia.html`: percurso metodológico
- `atlas.html`: integração do Atlas original via iframe + links de acesso
- `kallstenius.html`: apresentação interativa de nove quadros e gráfico de resultados
- `experimentos.html`: proposta experimental ainda em planejamento
- `evolucao.html`: linha do tempo filtrável

## Execução local
Basta abrir `index.html` em um navegador. Também é possível executar `python -m http.server 8000` na pasta para testar as rotas. Não há dependências de build. A fonte do Google Fonts é opcional e requer internet.

## Publicação no GitHub Pages
1. Crie um repositório público com o nome desejado (ex.: `lia-fernando`).
2. Faça upload de **todos** os arquivos da pasta, preservando o diretório `assets`.
3. Em **Settings → Pages → Build and deployment**, selecione `Deploy from a branch`, `main`, `/ (root)`.
4. O endereço será `https://fernandomarquesaluno-svg.github.io/lia-fernando/`. O formato `lia-fernando.github.io` só funciona se esse for o nome da conta ou organização no GitHub (ou com domínio próprio).

## Dependência do Atlas
A página `atlas.html` incorpora a versão **publicada** em `https://fernandomarquesaluno-svg.github.io/depression_poject/tabelas/comparativo/`. Esta integração não copia os arquivos, e a disponibilidade depende do projeto original e da política de incorporação do navegador. O link externo é oferecido como alternativa. Para independência total, exporte o código e os ativos do Atlas para uma pasta local `atlas/` e altere o `src` do iframe para esse caminho.

## Integridade acadêmica
O material distingue evidências da literatura e propostas ainda não executadas. Os valores de Kallstenius foram extraídos da apresentação técnica do repositório original. Referências: https://doi.org/10.2196/98925 e https://github.com/fernandomarquesaluno-svg/depression_poject.