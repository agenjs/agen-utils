import * as agen from '../dist/index.js';

// Prepare the mapping function
const list = [ 'a', 'b', 'c' ]
const cleanup = agen.listen(list, (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();

// Output:
// - a
// - b
// - c