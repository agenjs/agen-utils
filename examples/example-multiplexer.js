import agen from '../index.js';


// Generate new values:
const f = agen.multiplexer((o) => {
  (async () => {
    await o.next('Hello');
    await o.next('World');
    await o.next('!');
    await o.complete();
  })();
  return () => console.log('Done')
});

// Consume values in three different "threads".

// First consumer (the slowest one):
(async () => {
  for await (let value of f()) {
    console.log('* FIRST:', value);
    await new Promise(r => setTimeout(r, 300));
  }
})();

// Second consumer:
(async () => {
  for await (let value of f()) {
    console.log('* SECOND:', value);
  }
})();

// Third consumer:
(async () => {
  for await (let value of f()) {
    console.log('* THIRD:', value);
  }
})();

// Output:
// * FIRST: Hello
// * SECOND: Hello
// * THIRD: Hello
// * FIRST: World
// * SECOND: World
// * THIRD: World
// * FIRST: !
// * SECOND: !
// * THIRD: !
// Done