import * as agen from '../dist/index.js';

// Original data to iterate over:
const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

// Interrupt iterations on the third element
// (just before delivering the third element)
let f = agen.interrupt((value, idx) => idx === 3);
for await (let b of f(list)) {
  console.log(b);
}
// Will print
// - a
// - b 
// - c


// Interrupt iterations just after delivering the third value:
console.log('------------');
f = agen.interrupt(null, (value, idx) => idx === 3);
for await (let b of f(list)) {
  console.log(b);
}
// Will print
// ------------
// - a
// - b 
// - c
// - d