import * as agen from '../dist/index.js';

// Prepare the mapping function
const f = agen.iterator((o) => {
  (async () => {
    await o.next('Hello');
    await o.next('World');
    await o.next('!');
    o.complete();
  })();
  return () => console.log('Done')
});

for await (let item of f()) {
  console.log('-', item);
}
// Output:
// - Hello
// - World
// - !
// Done
