(() => {
  const script = document.currentScript;
  const panel = document.querySelector('[data-atlas-results]');
  const embedded = document.getElementById('studiesEmbedded');
  const labels = {empirico:'Pesquisa empírica', recurso:'Dataset/recurso', sintese:'Revisão/síntese'};
  const access = {
    publico:'Público', controlado:'Acesso controlado', restrito:'Restrito',
    parcial:'Acesso parcial', nao_confirmado:'Acesso sem confirmação', nao_aplica:'Sem corpus próprio'
  };
  const escape = value => String(value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]
  );
  const count = (items, values) => {
    const result = new Map();
    for (const item of items) {
      for (const value of new Set(values(item).filter(Boolean))) {
        result.set(value, (result.get(value) || 0) + 1);
      }
    }
    return [...result];
  };

  async function render() {
    const data = embedded ? JSON.parse(embedded.textContent) :
      await fetch(script.dataset.source).then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      });
    const studies = data.studies;
    const empirical = studies.filter(s => s.analysisTaxonomy?.publicationKind === 'empirico');
    const methods = s => s.analysisTaxonomy?.methodFamilies || [];
    const task = s => s.analysisTaxonomy?.primaryTask;
    const edges = count(empirical, s => methods(s).map(method => method + ' ↔ ' + task(s)));
    const pt = studies.filter(s => s.language === 'PT-BR');
    const pending = studies.filter(s => s.pending.length);
    const stats = [
      [studies.length, 'referências no levantamento'],
      [empirical.length + '/' + studies.length, 'estudos empíricos'],
      [pt.length, 'referências classificadas como PT-BR'],
      [edges.length, 'combinações método–tarefa no mapa']
    ];
    panel.querySelector('[data-result-content]')?.remove();
    const content = document.createElement('div');
    content.dataset.resultContent = '';
    content.innerHTML = '<dl class="result-metrics">' + stats.map(([number, caption]) =>
      '<div><dt>' + escape(caption) + '</dt><dd>' + number + '</dd></div>'
    ).join('') + '</dl>';
    if (embedded) {
      const dimensions = [
        ['Ano de publicação', studies, s => [s.year], 'Uma referência por ano.'],
        ['Idioma dos textos', studies, s => [s.language], 'Categorias registradas nas fichas. Diversos/NI reúne fontes heterogêneas ou sem idioma especificado.'],
        ['Natureza da publicação', studies, s => [labels[s.analysisTaxonomy?.publicationKind]], 'Uma classificação por referência.'],
        ['Família de método', empirical, methods, 'Uma publicação pode contribuir para mais de uma família.'],
        ['Tarefa-alvo principal', empirical, s => [task(s)], 'Uma tarefa principal por estudo empírico.'],
        ['Acesso aos datasets', studies, s => [access[s.datasetAudit?.accessStatus]], 'Classificação de acesso da ficha, inclusive acesso parcial e revisões sem corpus próprio.'],
        ['Família de corpus auditada', studies, s => [s.datasetAudit?.datasetFamily || 'Sem família consolidada'], 'Uma entrada por rótulo de família na ficha. Contagem de referências, inclusive reutilizações.']
      ];
      content.innerHTML += '<div class="result-controls"><label for="result-dimension">Distribuição</label><select id="result-dimension">' +
        dimensions.map(([title], index) => '<option value="' + index + '">' + escape(title) + '</option>').join('') +
        '</select></div><div id="result-chart" aria-live="polite"></div><p>' + pending.length + ' fichas com pendências sinalizadas. ' +
        edges.reduce((sum, [, n]) => sum + n, 0) + ' incidências estudo–método no mapa. ' + AtlasRanking.criteria.length +
        ' critérios disponíveis no comparador. <a href="#auditoria">Consultar pendências das fichas</a>.</p>';
      const picker = content.querySelector('select');
      const chart = content.querySelector('#result-chart');
      function draw() {
        const [title, items, values, note] = dimensions[Number(picker.value)];
        const entries = count(items, values);
        if (picker.value === '0') entries.sort(([a], [b]) => a - b);
        else entries.sort(([a, x], [b, y]) => y - x || a.localeCompare(b, 'pt-BR'));
        chart.innerHTML = '<p class="result-note">' + escape(note) + ' Base: ' + items.length +
          ' referências.</p><ul class="result-chart" aria-label="' + escape(title) + '">' + entries.map(([label, amount]) =>
            '<li><span>' + escape(label) + '</span><span class="result-track" aria-hidden="true"><i style="--value:' +
            (100 * amount / items.length) + '%"></i></span><strong>' + amount + '</strong></li>'
          ).join('') + '</ul>';
      }
      picker.addEventListener('change', draw);
      draw();
    }
    panel.append(content);
  }

  render().catch(error => {
    const fallback = panel.querySelector('[data-result-content]');
    if (fallback) fallback.textContent = 'Não foi possível carregar a distribuição. Consulte as fichas do Atlas.';
    console.error('Resultados do Atlas:', error);
  });
})();
