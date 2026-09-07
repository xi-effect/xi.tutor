import fs from 'node:fs';

const corpus = JSON.parse(fs.readFileSync(new URL('../tests/corpus/mathVisualizationCorpus.json', import.meta.url), 'utf8'));
const countBy = key => {
  const m = new Map();
  for (const item of corpus) {
    const values = Array.isArray(item[key]) ? item[key] : [item[key]];
    for (const value of values) m.set(value, (m.get(value) ?? 0) + 1);
  }
  return [...m.entries()].sort((a,b)=>b[1]-a[1]);
};
const regression = corpus.filter(item => item.status === 'regression').length;
const coverage = corpus.filter(item => item.status === 'coverage').length;
console.log(`Corpus: ${corpus.length} total / ${regression} regression / ${coverage} coverage`);
console.log('\nBy visualization family');
console.table(countBy('expected').map(([family,count])=>({family,count})));
console.log('\nBy primary grade');
console.table(countBy('grade').sort((a,b)=>Number(a[0])-Number(b[0])).map(([grade,count])=>({grade,count})));
console.log('\nBy course');
console.table(countBy('course').map(([course,count])=>({course,count})));
console.log('\nBy exam alignment');
console.table(countBy('exams').map(([exam,count])=>({exam,count})));
