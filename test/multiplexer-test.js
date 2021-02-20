import tape from "tape-await";
import agen from "../index.js";

const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

tape(`multiplexer(init) should add multiple reader for one generator`, async (test) => {
  let finished = false;;
  const f = agen.multiplexer((o) => {
    (async () => {
      for await (let value of toAsyncIterator(list)) {
        await o.next(value);
      }
      await o.complete();
    })();
    return () => finished = true;
  });
  let results = [];
  const promises = [];
  const N = 3;
  for (let i = 0; i < N; i++) {
    const iterator = f();
    const array = [];
    results.push(array);
    promises.push((async (it, array) => {  
      for await (let value of it) {
        array.push(value);
      }
    })(iterator, array));
  }
  await Promise.all(promises);

  const control = Array.from({ length : N }).map(_ => ([...list]));
  test.deepEqual(results, control);
});


async function* toAsyncIterator(list, action) {
  let idx = 0;
  for (let value of list) {
    action && (await action(value, idx++));
    yield value;
    await new Promise(r => setTimeout(r, 5));
  }
}