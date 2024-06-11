import * as agen from '../dist/index.js';

// Prepare the mapping function
const f = agen.each(
  (v, i) => console.log(`- before [${i}:${v}]`),
  (v, i) => console.log(`- after [${i}:${v}]`)
);

// Iterate over a list of values
const list = ['a', 'b', 'c']
for await (let value of f(list)) {
  console.log('  - ', value);
}
// Will print
// - before [0:a]
//   - a
// - after [0:a]
// - before [1:b]
//   - b
// - after [1:b]
// - before [2:c]
//   - c
// - after [2:c]
