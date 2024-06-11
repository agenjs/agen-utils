import * as agen from '../dist/index.js';

const delay = async (t) => await new Promise(r => setTimeout(r, t));

const iterator = agen.iterate(o => {
  let stop = false;
  (async () => {
    try {
      const count = 1000; 
      for (let i = 0; !stop && i < count; i++) {
        await o.next(`Hello - ${i}`); // Wait until this value is consumed
        await delay(300 * Math.random());
      }
      // Completes iterations
      await o.complete();
    } catch (err) {
      // Notifies about an error
      await o.error(err);
    } finally {
      console.log('FIN.')
    }
  })();
  return () => stop = true;
})

let idx = 0;
for await (let value of iterator) {
  console.log(value);
  if (idx++ >= 5) break;
  await delay(200 * Math.random());
}

// Output:
// Hello - 0
// Hello - 1
// Hello - 2
// Hello - 3
// Hello - 4
// Hello - 5
// FIN.
