import agen from '../index.js';

const list = [
  'First Message',
  'Hello world',
  'Second Message',
  'Hello John Smith'
]
const f = agen.filter((v, i) => v.indexOf('Hello') >= 0)
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - Hello world
// - Hello John Smith
