import tape from "tape-await";
import agen from "../index.js";

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];

tape(
  `multiplexer(init) should add multiple reader for one generator`,
  async (test) => {
    const it = toAsyncIterator(list);
    const f = agen.multiplexer(it);
    let results = [];
    const promises = [];
    const N = 3;
    for (let i = 0; i < N; i++) {
      const array = [];
      results.push(array);
      promises.push((async (array) => {
        for await (const value of f()) {
          array.push(value);
          await delay(Math.round(Math.random() * 10));
        }
      })(array));
    }
    await Promise.all(promises);

    const control = Array.from({ length: N }).map((_) => [...list]);
    test.deepEqual(results, control);
  },
);

async function* toAsyncIterator(list, action) {
  let idx = 0;
  for (let value of list) {
    action && (await action(value, idx++));
    yield value;
    await delay(5);
  }
}

async function delay(timeout =10) {
  await new Promise((r) => setTimeout(r, timeout));
}
