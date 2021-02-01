import agen from '../index.js';

// Prepare the mapping function
const f = agen.map((v, i) => v.toUpperCase());

// Iterate over a list of transformed values
const list = ['a', 'b', 'c']
for await (let item of f(list)) {
  console.log('-', item);
}
// Output:
// - A
// - B
// - C