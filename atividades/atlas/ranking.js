/* O catálogo descreve as características publicadas, com null para informação inconclusiva. */
const AtlasRanking = (() => {
  const present = (value, test) => value == null || value === '' ? null : test(value);
  const methods = (s, name) => present(s.analysisTaxonomy?.methodFamilies, list => list.includes(name));
  const condition = (s, name) => present(s.conditions, list =>
    list.includes(name) || (s.analysisTaxonomy?.primaryTask || '').includes(name)
  );
  const platform = (s, pattern) => {
    const value = s.datasetAudit?.platform;
    if (pattern.test(value || '')) return true;
    return !value || /não confirmad[oa]|não informad[oa]|não especificad[oa]/i.test(value) ? null : false;
  };
  const criteria = [
    {id:'empirico', group:'Publicação e dados', label:'Pesquisa empírica', match:s=>present(s.analysisTaxonomy?.publicationKind, v=>v==='empirico')},
    {id:'ptbr', group:'Publicação e dados', label:'Textos exclusivamente em PT-BR', match:s=>!s.language || s.language==='Diversos/NI' ? null : s.language==='PT-BR'},
    {id:'publico', group:'Publicação e dados', label:'Dataset com acesso público documentado', match:s=>present(s.datasetAudit?.accessStatus, v=>v==='nao_confirmado' ? null : v==='publico')},
    {id:'recente', group:'Publicação e dados', label:'Publicação de 2024 a 2026', match:s=>present(s.year, v=>v>=2024 && v<=2026)},
    {id:'llms', group:'Métodos e avaliação', label:'Utiliza LLMs', match:s=>methods(s,'LLMs')},
    {id:'transformers', group:'Métodos e avaliação', label:'Utiliza Transformers', match:s=>methods(s,'Transformers')},
    {id:'f1', group:'Métodos e avaliação', label:'Ficha registra métrica F1', match:s=>/\bf1\b/i.test(s.results || '') ? true : null},
    {id:'depressao', group:'Tarefa e plataforma', label:'Investiga depressão', match:s=>condition(s,'Depressão')},
    {id:'ansiedade', group:'Tarefa e plataforma', label:'Investiga ansiedade', match:s=>condition(s,'Ansiedade')},
    {id:'estresse', group:'Tarefa e plataforma', label:'Investiga estresse', match:s=>condition(s,'Estresse')},
    {id:'reddit', group:'Tarefa e plataforma', label:'Textos originados no Reddit', match:s=>platform(s,/reddit/i)},
    {id:'twitter', group:'Tarefa e plataforma', label:'Textos originados no Twitter/X', match:s=>platform(s,/twitter/i)}
  ];
  const profiles = {
    llms: {empirico:5, llms:4, ptbr:3},
    transformers: {empirico:5, transformers:4, ptbr:3}
  };
  function rank(studies, weights) {
    const active = criteria.map(criterion => ({...criterion, weight:weights[criterion.id]}))
      .filter(({weight}) => Number.isInteger(weight) && weight > 0 && weight <= 5);
    if (!active.length) return [];
    const total = active.reduce((sum, {weight}) => sum + weight, 0);
    return studies.map(study => {
      const breakdown = active.map(criterion => ({
        label:criterion.label, weight:criterion.weight, status:criterion.match(study)
      }));
      const known = breakdown.reduce((sum, item) => sum + (item.status === null ? 0 : item.weight), 0);
      const earned = breakdown.reduce((sum, item) => sum + (item.status === true ? item.weight : 0), 0);
      return {study, breakdown, total, known, earned, score:known ? 100 * earned / known : null};
    }).sort((a, b) =>
      Number(b.known > 0) - Number(a.known > 0)
      || b.earned * a.known - a.earned * b.known
      || b.known - a.known
      || a.study.id - b.study.id
    );
  }
  return {criteria, profiles, rank};
})();

if (typeof module !== 'undefined') module.exports = AtlasRanking;
