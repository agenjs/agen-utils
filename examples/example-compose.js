import agen from '../index.js';

const f = agen.compose(
  agen.filter((v, i) => (i % 2 == 0)), // Filter only even values
  agen.each(                           // Prints "xml" tags
    (v, i) => console.log(`<${v}>`),
    (v, i) => console.log(`</${v}>`),
  ),
  agen.map((v, i) => v.toUpperCase()), // Transforms characters to upper case
);

const list = ['a', 'b', 'c', 'd', 'e'];
for await (let v of f(list)) {
  console.log('  -', v);
}