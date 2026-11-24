(() => {
  const {criteria, profiles, rank} = AtlasRanking;
  const byId = id => document.getElementById(id);
  const criteriaPanel = byId('rankCriteria');
  const resultsPanel = byId('rankResults');
  const catalog = JSON.parse(byId('studiesEmbedded').textContent).studies;
  const weights = Object.fromEntries(criteria.map(({id}) => [id, 3]));
  const selected = new Set();

  function render() {
    const applied = Object.fromEntries([...selected].map(id => [id, weights[id]]));
    const rows = rank(catalog, applied);
    const total = Object.values(applied).reduce((sum, weight) => sum + weight, 0);
    byId('rankSelectionCount').textContent = selected.size + ' critérios selecionados';
    byId('rankSummary').textContent = total
      ? rows.length + ' referências · ' + total + ' pontos de peso selecionado'
      : 'Selecione critérios com peso maior que zero.';
    if (!rows.length) {
      resultsPanel.innerHTML = '<p class="loading">Selecione um exemplo ou ajuste os critérios abaixo.</p>';
      return;
    }
    resultsPanel.innerHTML = rows.map(({study, score, earned, known, total, breakdown}, index) => {
      const parts = breakdown.map(item => {
        const status = item.status === null ? 'Sem confirmação' :
          item.status ? item.weight + '/' + item.weight + ' pts' : '0/' + item.weight + ' pts';
        return '<li>' + escapeHTML(item.label) + ' · ' + status + '</li>';
      }).join('');
      const matched = breakdown.filter(item => item.status === true);
      return '<article class="rank-card" data-study="' + study.id + '">' +
        '<div class="rank-score"><strong>' + (score === null ? '—' : Math.round(score) + '%') +
        '</strong><span>' + earned + '/' + known + ' pontos</span></div>' +
        '<div><h5>' + (index + 1) + '. ' + escapeHTML(study.title) + '</h5>' +
        '<p>' + study.year + ' · ' + escapeHTML(researchKind(study)) + ' · ' + escapeHTML(study.language) +
        ' · evidência disponível para ' + known + '/' + total + ' pontos de peso</p>' +
        '<div class="rank-evidence">' + matched.map(item => '<span>' + escapeHTML(item.label) + '</span>').join('') + '</div>' +
        '<details><summary>Ver cálculo por critério</summary><ul>' + parts + '</ul></details>' +
        '<div class="rank-links"><a href="' + escapeHTML(study.url) + '" target="_blank" rel="noopener noreferrer">Fonte original ↗</a>' +
        '<button type="button" data-rank-study="' + study.id + '">Abrir ficha</button>' +
        '<button type="button" data-rank-compare="' + study.id + '" aria-pressed="' + STATE.selected.includes(study.id) +
        '">' + (STATE.selected.includes(study.id) ? 'Remover da comparação' : 'Comparar +') + '</button></div></div></article>';
    }).join('');
  }

  function syncControls() {
    criteria.forEach(({id}) => {
      byId('criterion-' + id).checked = selected.has(id);
      const slider = byId('weight-' + id);
      slider.disabled = !selected.has(id);
      slider.value = weights[id];
      slider.nextElementSibling.textContent = weights[id] + '/5';
    });
  }

  function loadProfile(profile) {
    selected.clear();
    criteria.forEach(({id}) => { weights[id] = profile[id] ?? 3; });
    Object.keys(profile).forEach(id => selected.add(id));
    syncControls();
    render();
  }

  const groups = [...new Set(criteria.map(({group}) => group))];
  criteriaPanel.innerHTML = groups.map(group =>
    '<fieldset class="rank-group"><legend>' + escapeHTML(group) + '</legend>' +
    criteria.filter(item => item.group === group).map(({id, label}) =>
      '<div class="rank-option"><div class="rank-option-top"><label for="criterion-' + id +
      '"><input type="checkbox" id="criterion-' + id + '" data-check="' + id + '">' + escapeHTML(label) +
      '</label></div><div class="rank-weight"><span>Peso</span><input type="range" min="0" max="5" id="weight-' +
      id + '" data-weight="' + id + '" aria-label="Peso — ' + escapeHTML(label) +
      '"><output for="weight-' + id + '"></output></div></div>'
    ).join('') + '</fieldset>'
  ).join('');

  criteriaPanel.addEventListener('change', event => {
    const id = event.target.dataset.check;
    if (!id) return;
    if (event.target.checked) selected.add(id);
    else selected.delete(id);
    syncControls();
    render();
  });
  criteriaPanel.addEventListener('input', event => {
    const id = event.target.dataset.weight;
    if (!id) return;
    weights[id] = Number(event.target.value);
    event.target.nextElementSibling.textContent = weights[id] + '/5';
    render();
  });
  resultsPanel.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (button?.dataset.rankStudy) showDetails(button.dataset.rankStudy);
    if (button?.dataset.rankCompare) {
      const id = button.dataset.rankCompare;
      toggleCompare(id);
      resultsPanel.querySelector('[data-rank-compare="' + id + '"]')?.focus();
    }
  });
  document.addEventListener('atlas-comparison', () => {
    resultsPanel.querySelectorAll('[data-rank-compare]').forEach(button => {
      const active = STATE.selected.includes(Number(button.dataset.rankCompare));
      button.setAttribute('aria-pressed', String(active));
      button.textContent = active ? 'Remover da comparação' : 'Comparar +';
    });
  });
  byId('rankClear').addEventListener('click', () => loadProfile({}));
  byId('rankExample').addEventListener('click', () => loadProfile(profiles.llms));
  byId('rankTransformers').addEventListener('click', () => loadProfile(profiles.transformers));
  loadProfile(profiles.llms);
})();
