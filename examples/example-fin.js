import agen from '../index.js';
// import agen from '@agen/utils';

const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
const f = agen.fin((error, count) => {
  console.log(`count: ${count}`);
  console.log(`error: ${error}`);
});
for await (let v of f(list)) { }

// Output:
// count: 11
// error: undefined
