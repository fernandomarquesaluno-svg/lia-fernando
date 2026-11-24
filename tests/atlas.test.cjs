const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {criteria, profiles, rank} = require('../atividades/atlas/ranking.js');
const data = require('../atividades/atlas/estudos.json');
const {studies} = data;
const byId = (rows, id) => rows.find(row => row.study.id === id);

test('D01: catálogo, base HTML, IDs, fontes e taxonomia da rede', () => {
  const html = fs.readFileSync(path.join(__dirname, '../atividades/atlas/index.html'), 'utf8');
  const embedded = html.match(/id="studiesEmbedded">([^<]+)<\/script>/)[1];
  assert.deepEqual(JSON.parse(embedded), data);
  assert.equal(studies.length, 33);
  assert.equal(new Set(studies.map(s => s.id)).size, 33);
  assert.equal(new Set(studies.map(s => s.url)).size, 33);
  assert(studies.every(s => s.title && s.year && new URL(s.url).protocol === 'https:'));
  const empirical = studies.filter(s => s.analysisTaxonomy.publicationKind === 'empirico');
  assert.equal(empirical.length, 25);
  const edges = empirical.flatMap(s => s.analysisTaxonomy.methodFamilies.map(m => m + '|' + s.analysisTaxonomy.primaryTask));
  assert.equal(new Set(edges).size, 16);
  assert.equal(edges.length, 36);
});

test('R01: pesos iguais, diferentes, zero, remoção e nenhum critério', () => {
  const study = studies.find(s => s.id === 7);
  assert.equal(rank([study], {ptbr:3, transformers:3})[0].score, 50);
  assert.equal(rank([study], {ptbr:4, transformers:1})[0].score, 80);
  assert.equal(rank([study], {ptbr:4, transformers:0})[0].score, 100);
  assert.equal(rank([study], {transformers:1})[0].score, 0);
  assert.deepEqual(rank([study], {ptbr:0, desconhecido:5}), []);
  assert.deepEqual(rank([study], {}), []);
  assert.deepEqual(rank([], profiles.llms), []);
});

test('R02: evidência desconhecida, zero confirmado e cobertura', () => {
  const rows = rank(studies, {publico:4, ptbr:1});
  const unknown = byId(rows, 19);
  const mismatch = byId(rows, 8);
  assert.equal(mismatch.study.language, 'PT-BR');
  assert.equal(mismatch.study.datasetAudit.accessStatus, 'restrito');
  assert.deepEqual([unknown.score, unknown.earned, unknown.known, unknown.total], [100, 1, 1, 5]);
  assert.deepEqual([mismatch.score, mismatch.earned, mismatch.known, mismatch.total], [20, 1, 5, 5]);
  assert.equal(unknown.breakdown.find(item => item.weight === 4).status, null);
  assert.equal(mismatch.breakdown.find(item => item.weight === 4).status, false);
  assert.equal(byId(rank(studies, {publico:5}), 19).score, null);
});

test('R03: exemplos reais, empates por cobertura e ID e ordem determinística', () => {
  assert.equal(criteria.length, 12);
  const llms = rank(studies, profiles.llms);
  const transformers = rank(studies, profiles.transformers);
  assert.deepEqual(llms.slice(0, 2).map(s => s.study.id), [7, 13]);
  assert.deepEqual(transformers.slice(0, 2).map(s => s.study.id), [8, 19]);
  assert.equal(byId(llms, 7).score, 100);
  assert.equal(byId(transformers, 7).score, 100 * 8 / 12);
  assert.equal(byId(llms, 8).score, 100 * 8 / 12);
  assert.equal(byId(transformers, 8).score, 100);
  assert.deepEqual(rank(studies.slice().reverse(), profiles.llms), llms);
  const example = [{id:1, language:'Inglês'}, {id:2, language:'Inglês', year:2021}];
  assert.deepEqual(rank(example, {ptbr:1, recente:5}).map(s => s.study.id), [2, 1]);
});
