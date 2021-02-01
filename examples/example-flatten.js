import agen from '../index.js';

const list = ['a', ['b', [['c', 'd'], [['e']], 'f'], 'g'], ['h', [['i'], 'j'], 'k']];
const f = agen.flatten();
for await (let v of f(list)) {
  console.log('-', v);
}
// Output:
// - a
// - b
// - c
// - d
// - ...
