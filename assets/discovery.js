/* Explorador por condição — mesma experiência nos dois Atlas e no portal. */
(() => {
  'use strict';
  const script = document.currentScript;
  const source = script.dataset.source || 'estudos.json';
  const atlasLink = script.dataset.atlas || './';
  const companion = script.dataset.counterpart || '';
  const home = script.dataset.home || '';
  const isAtlas = script.dataset.kind === 'atlas';
  const anchor = isAtlas ? document.querySelector('#conexoes') : document.querySelector('.hero');
  if (!anchor) return;

  const topics = [
    {key: 'Todas', label: 'Visão geral', color: '#7df4db'},
    {key: 'Depressão', label: 'Depressão', color: '#7df4db'},
    {key: 'Depressão e ansiedade', label: 'Depressão + ansiedade', color: '#9eaeff'},
    {key: 'Estresse', label: 'Estresse', color: '#ffcb91'},
    {key: 'Risco suicida', label: 'Risco suicida', color: '#ff94b3'},
    {key: 'Múltiplas condições', label: 'Múltiplas condições', color: '#8ad9ff'}
  ];
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const section = document.createElement('section');
  section.className = 'evo-explorer';
  section.id = 'atlas-categorias';
  section.setAttribute('aria-labelledby', 'evo-title');
  section.innerHTML = [
    '<div class="evo-inner">',
      '<div class="evo-heading"><div><span class="evo-kicker"><span class="evo-pulse"></span> EXPLORAÇÃO INTERATIVA / 2020–2026</span>',
      '<h2 id="evo-title">Escolha um tema.<br><em>Veja a ciência reagir.</em></h2>',
      '<p>Toque em uma categoria para atualizar o panorama, os métodos e as publicações. As relações representam associações bibliográficas, não qualidade clínica.</p></div>',
      '<div class="evo-orbit" aria-hidden="true"><i></i><i></i><i></i><b>IA<span>↔</span>PLN</b></div></div>',
      '<div class="evo-tabs" role="group" aria-label="Escolher condição investigada">',
       topics.map(t => '<button class="evo-topic" type="button" data-topic="'+safe(t.key)+'" style="--topic:'+t.color+'" aria-pressed="false">'+safe(t.label)+'</button>').join(''),
      '</div>',
      '<div class="evo-workspace" aria-live="polite" aria-atomic="false">',
        '<div class="evo-feature"><span class="evo-label">RECORTE EM FOCO</span><div class="evo-big" id="evo-count">–</div><h3 id="evo-topic-title">Explorando as evidências</h3><p id="evo-context">Carregando os estudos…</p>',
          '<div class="evo-actions"><a class="evo-action" id="evo-go" href="'+safe(isAtlas?'#conexoes':atlasLink+'#conexoes')+'">'+(isAtlas?'Ver conexões iluminadas':'Explorar rede completa')+' <span aria-hidden="true">↗</span></a>',
          (companion ? '<a class="evo-action evo-alt" id="evo-companion" href="'+safe(companion)+'">Abrir no outro Atlas ↗</a>' : '')+'</div>',
        '</div>',
        '<div class="evo-analysis"><div class="evo-analysis-head"><div><span class="evo-label">MÉTODOS ASSOCIADOS</span><h3>Mapa de abordagens</h3></div><span class="evo-annotation">Estudos, não desempenho</span></div><div class="evo-bars" id="evo-methods"></div></div>',
        '<div class="evo-publications"><div class="evo-analysis-head"><div><span class="evo-label">PUBLICAÇÕES</span><h3>Para começar a leitura</h3></div><span class="evo-annotation" id="evo-sample">Recorte científico</span></div><div class="evo-cards" id="evo-studies"></div></div>',
      '</div>',
      '<div class="evo-bottom"><span><i></i> Selecione uma categoria e observe os gráficos se atualizarem.</span>',
      (home ? '<a href="'+safe(home)+'">Portal acadêmico ↗</a>' : '<a href="'+safe(atlasLink)+'">Ir ao Atlas científico ↗</a>'),
      '</div>',
    '</div>'
  ].join('');
  if (isAtlas) anchor.insertAdjacentElement('beforebegin', section);
  else anchor.insertAdjacentElement('afterend', section);

  const q = selector => section.querySelector(selector);
  const allButtons = [...section.querySelectorAll('.evo-topic')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let studies = [];
  let active = 'Todas';
  const isEmpirical = item => item.analysisTaxonomy?.publicationKind === 'empirico';

  function updateExistingNetwork(topic) {
    if (!isAtlas) return;
    const diagram = document.querySelector('#conexaoViz');
    if (!diagram) return;
    if (topic === 'Todas') {
      const clear = document.querySelector('#clearConnectionSelection');
      if (clear && !clear.hidden) clear.click();
    } else {
      const match = [...diagram.querySelectorAll('.c-hub[data-c]')].find(node => node.dataset.c === topic);
      if (match) {
        const selected = match.classList.contains('selected');
        if (!selected) match.dispatchEvent(new MouseEvent('click', {bubbles: true}));
      }
    }
  }

  function activate(topic, opts = {}) {
    const current = topics.find(t => t.key === topic) || topics[0];
    active = current.key;
    section.style.setProperty('--evo-accent', current.color);
    allButtons.forEach(button => {
      const selected = button.dataset.topic === active;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const chosen = studies.filter(item => isEmpirical(item) && (active === 'Todas' || item.analysisTaxonomy.primaryTask === active));
    const count = chosen.length;
    q('#evo-count').textContent = String(count).padStart(2, '0');
    q('#evo-topic-title').textContent = active === 'Todas' ? 'Pesquisas empíricas no recorte' : current.label;
    q('#evo-context').textContent = active === 'Todas'
      ? '25 estudos empíricos em 33 referências. Os demais registros são recursos, datasets e sínteses bibliográficas.'
      : count + (count === 1 ? ' estudo empírico relacionado à tarefa-alvo principal. ' : ' estudos empíricos relacionados à tarefa-alvo principal. ') + 'A mesma publicação pode utilizar mais de um método.';
    const countMethods = new Map();
    chosen.forEach(item => (item.analysisTaxonomy.methodFamilies || []).forEach(method => countMethods.set(method, (countMethods.get(method) || 0) + 1)));
    const ranked = [...countMethods.entries()].sort((a,b) => b[1]-a[1] || a[0].localeCompare(b[0], 'pt-BR')).slice(0, 6);
    const max = Math.max(1, ...ranked.map(pair => pair[1]));
    q('#evo-methods').innerHTML = ranked.length ? ranked.map((pair, index) =>
      '<div class="evo-bar-row" style="--delay:'+index*65+'ms"><span>'+safe(pair[0])+'</span><div class="evo-bar-track"><i style="--bar-width:'+(pair[1]/max*100)+'%"></i></div><b>'+pair[1]+'</b></div>'
    ).join('') : '<p class="evo-empty">Nenhum método classificado neste recorte.</p>';
    const recent = chosen.slice().sort((a,b) => b.year-a.year || a.id-b.id).slice(0, 3);
    q('#evo-sample').textContent = count + (count === 1 ? ' publicação' : ' publicações');
    q('#evo-studies').innerHTML = recent.map((item,index) =>
      '<a class="evo-study" style="--delay:'+index*70+'ms" href="'+safe(item.url)+'" target="_blank" rel="noopener noreferrer"><span>'+item.year+' · '+safe(item.language)+'</span><strong>'+safe(item.title)+'</strong><small>Ler publicação ↗</small></a>'
    ).join('') || '<p class="evo-empty">Nenhuma publicação empírica nesta categoria.</p>';
    const url = atlasLink + (active === 'Todas' ? '' : '?categoria='+encodeURIComponent(active)) + '#atlas-categorias';
    if (!isAtlas) q('#evo-go').href = url;
    const companionLink = q('#evo-companion');
    if (companionLink) companionLink.href = companion + (active === 'Todas' ? '' : '?categoria='+encodeURIComponent(active)) + '#atlas-categorias';
    if (isAtlas && !opts.skipNetwork) updateExistingNetwork(active);
    if (!reduceMotion && !opts.initial) {
      section.classList.remove('evo-changing');
      void section.offsetWidth;
      section.classList.add('evo-changing');
    }
  }

  section.addEventListener('click', event => {
    const button = event.target.closest('.evo-topic');
    if (button && studies.length) activate(button.dataset.topic);
  });
  async function initialize() {
    try {
      const embedded = document.querySelector('#studiesEmbedded');
      const parsed = embedded ? JSON.parse(embedded.textContent) : await (await fetch(source)).json();
      if (!Array.isArray(parsed.studies)) throw new Error('Estrutura de estudos ausente');
      studies = parsed.studies;
      const query = new URLSearchParams(location.search).get('categoria');
      const initial = topics.some(topic => topic.key === query) ? query : 'Todas';
      activate(initial, {initial: true});
      if (isAtlas) document.body.classList.add('evo-ready');
    } catch (error) {
      console.error('Explorador de condições:', error);
      q('#evo-context').textContent = 'Não foi possível carregar os dados. A biblioteca científica permanece acessível.';
      q('#evo-methods').innerHTML = '<p class="evo-empty">Dados temporariamente indisponíveis.</p>';
    }
  }
  initialize();
})();
