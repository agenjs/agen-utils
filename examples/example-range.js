import agen from '../index.js';

const f = agen.range(1, 3);
const list = ['a', 'b', 'c', 'd', 'e', 'f']
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - b
// - c
// - d