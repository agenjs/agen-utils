import * as agen from '../dist/index.js';

// Prepare the mapping function
const numbers = [ '007', '000', '008' ]
const names = [ 'James Bond', 'John Smith' ]
let cleanup;

// ------------------------------------------
// Example 1: listen iterators arrays
cleanup = agen.listenAll([
  toAsyncIterator(numbers),
  toAsyncIterator(names)
], (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();
// Output:
// - [ '007', undefined ]
// - [ '007', 'James Bond' ]
// - [ '000', 'James Bond' ]
// - [ '000', 'John Smith' ]
// - [ '008', 'John Smith' ]

// ------------------------------------------
// Example 2: listen objects with iterators
cleanup = agen.listenAll({
  number : toAsyncIterator(numbers),
  name : toAsyncIterator(names)
}, (v) => console.log('-', v));
// ...
await new Promise(r => setTimeout(r, 100));
cleanup();
// Output:
// - { number: '007', name: undefined }
// - { number: '007', name: 'James Bond' }
// - { number: '000', name: 'James Bond' }
// - { number: '000', name: 'John Smith' }
// - { number: '008', name: 'John Smith' }


// ---------------------------------------
// Utility method transforming arrays to async iterators
async function* toAsyncIterator(list, delay = 10) {
  for await (const value of list) {
    await new Promise((r) => setTimeout(r, Math.round(Math.random(delay))));
    yield value;
  }
}
