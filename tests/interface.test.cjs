const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {setTimeout: wait} = require('node:timers/promises');
const {JSDOM, ResourceLoader, VirtualConsole} = require('jsdom');

const root = path.resolve(__dirname, '..');
const origin = 'https://atlas.test/lia-fernando/';
const fileFor = url => path.join(root, new URL(url).pathname.replace('/lia-fernando/', ''));
class LocalFiles extends ResourceLoader {
  fetch(url) {
    if (url.startsWith(origin)) return fs.promises.readFile(fileFor(url));
    return null;
  }
}
async function open(file) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => errors.push(error.message));
  virtualConsole.on('error', (...error) => errors.push(error.join(' ')));
  const dom = new JSDOM(fs.readFileSync(path.join(root, file)), {
    url:new URL(file, origin).href, runScripts:'dangerously', resources:new LocalFiles(),
    virtualConsole, pretendToBeVisual:true,
    beforeParse(window) {
      window.matchMedia = () => ({matches:true});
      window.HTMLElement.prototype.scrollIntoView = () => {};
      window.fetch = async url => ({
        ok:true, json:async () => JSON.parse(await fs.promises.readFile(fileFor(new URL(url, window.location.href))))
      });
    }
  });
  if (dom.window.document.readyState !== 'complete') {
    await new Promise(resolve => dom.window.addEventListener('load', resolve, {once:true}));
  }
  for (let retries = 0; !dom.window.document.querySelector('.result-metrics') && retries < 25; retries++) await wait(10);
  return {dom, errors};
}
const value = (dom, selector, next, type = 'change') => {
  const field = dom.window.document.querySelector(selector);
  field.value = next;
  field.dispatchEvent(new dom.window.Event(type, {bubbles:true}));
};
const click = (d, selector) => d.querySelector(selector).click();

test('I01: a página inicial apresenta objetivo, links diretos e contagens dinâmicas', async () => {
  const {dom, errors} = await open('index.html');
  try {
    const d = dom.window.document;
    assert.match(d.querySelector('h1').textContent, /Atlas de Evidências/);
    assert.match(d.querySelector('.project-question').textContent, /Pergunta orientadora/);
    const context = new JSDOM(fs.readFileSync(path.join(root, 'contexto.html'), 'utf8'));
    try {
      assert.equal(
        d.querySelector('#pergunta-orientadora').textContent,
        context.window.document.querySelector('#pergunta-orientadora').textContent
      );
    } finally { context.window.close(); }
    assert.deepEqual([...d.querySelectorAll('.result-metrics dd')].map(el => el.textContent), ['33', '25/33', '8', '16']);
    for (const href of ['atividades/atlas/#conexoes','atividades/atlas/#comparar','atividades/deproberta/#video','evolucao.html']) {
      assert(d.querySelector('a[href="' + href + '"]'));
    }
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('I02: mapa, fichas, filtros, ranking, comparação e gráfico no DOM', async () => {
  const {dom, errors} = await open('atividades/atlas/index.html');
  try {
    const d = dom.window.document;
    const text = selector => d.querySelector(selector).textContent;
    assert.equal(d.querySelectorAll('.c-link').length, 16);
    const depression = d.querySelector('.c-hub[data-c="Depressão"]');
    depression.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'Enter',bubbles:true}));
    assert.equal(text('#edgeCount'), '16 estudos');
    assert.equal(d.querySelectorAll('.c-link.active').length, 6);
    click(d, '[data-network-study]');
    assert.equal(d.querySelector('#modal').getAttribute('aria-hidden'), 'false');
    d.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'Escape'}));
    assert.equal(d.querySelector('#modal').getAttribute('aria-hidden'), 'true');
    click(d, '#edgeJump');
    assert.match(text('#countResults'), /^16 de 33/);
    click(d, '#clearConnectionSelection');
    assert.equal(text('#edgeTitle'), 'Visão geral');
    assert.equal(d.querySelectorAll('.c-link.dim').length, 0);
    click(d, '#networkZoomIn');
    assert.equal(d.querySelector('#conexaoViz').style.getPropertyValue('--network-zoom'), '1.25');
    click(d, '#networkZoomOut');
    assert.equal(d.querySelector('#conexaoViz').style.getPropertyValue('--network-zoom'), '1');
    click(d, '#clearFilters');
    value(dom, '#langFilter', 'PT-BR');
    value(dom, '#kindFilter', 'Pesquisa empírica');
    value(dom, '#query', '  nagamatu  ', 'input');
    assert.match(text('#countResults'), /^1 de 33/);
    value(dom, '#query', 'uma string sem correspondência', 'input');
    assert.match(text('#countResults'), /^0 de 33/);
    click(d, '#clearFilters');
    assert.match(text('#countResults'), /^33 de 33/);
    assert.equal(d.querySelector('.rank-card').dataset.study, '7');
    click(d, '#rankTransformers');
    assert.equal(d.querySelector('.rank-card').dataset.study, '8');
    value(dom, '#weight-transformers', '0', 'input');
    assert.equal(text('#rankSummary'), '33 referências · 8 pontos de peso selecionado');
    click(d, '#rankClear');
    assert.equal(d.querySelectorAll('.rank-card').length, 0);
    click(d, '#rankExample');
    click(d, '[data-rank-compare="7"]');
    click(d, '[data-rank-compare="20"]');
    assert.match(text('#slotA'), /Nagamatu/);
    assert.match(text('#slotB'), /Santos/);
    assert(d.querySelector('#comparisonFields').children.length > 0);
    click(d, '#clearComparison');
    assert.equal(d.querySelector('[data-rank-compare="7"]').getAttribute('aria-pressed'), 'false');
    value(dom, '#result-dimension', '3');
    assert.match(text('#result-chart'), /Transformers14/);
    assert.match(text('#result-chart'), /25 referências/);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});

test('I03: rotas do portal, âncoras e filtro da evolução', async () => {
  const pages = ['index.html','contexto.html','metodologia.html','trabalhos.html','evolucao.html','apresentacao.html',
    'atividades/atlas/index.html','atividades/deproberta/index.html','atividades/kallstenius/index.html',
    'atividades/levantamento/index.html'];
  assert(!fs.existsSync(path.join(root, 'atividades/experimentos/index.html')));
  assert(!fs.existsSync(path.join(root, 'experimentos.html')));
  const markup = new Map(pages.map(page => [page, new JSDOM(fs.readFileSync(path.join(root, page), 'utf8')).window]));
  try {
    for (const page of pages) {
      const d = markup.get(page).document;
      const ids = [...d.querySelectorAll('[id]')].map(el => el.id);
      assert.equal(new Set(ids).size, ids.length);
      const internal = [...d.querySelectorAll('a[href]')].filter(el => !/^(https?:|mailto:|tel:|javascript:)/.test(el.getAttribute('href')));
      for (const a of internal) {
        const url = new URL(a.getAttribute('href'), new URL(page, origin));
        if (!url.href.startsWith(origin)) continue;
        const file = fileFor(url);
        const target = fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
        assert(fs.existsSync(target), page + ' → ' + a.getAttribute('href'));
        const doc = markup.get(path.relative(root, target))?.document;
        if (doc && url.hash) assert(doc.getElementById(decodeURIComponent(url.hash.slice(1))), url.href);
      }
    }
  } finally { for (const window of markup.values()) window.close(); }

  const {dom, errors} = await open('evolucao.html');
  try {
    const d = dom.window.document;
    const before = d.querySelectorAll('.event').length;
    click(d, '[data-filter="site"]');
    assert(d.querySelectorAll('.event:not([hidden])').length < before);
    assert(d.querySelector('.event:not([hidden]) a[href="atividades/deproberta/#video"]'));
    click(d, '[data-filter="todos"]');
    assert.equal(d.querySelectorAll('.event:not([hidden])').length, before);
    assert.deepEqual(errors, []);
  } finally { dom.window.close(); }
});
