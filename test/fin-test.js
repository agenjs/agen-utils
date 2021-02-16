import tape from "tape-await";
import agen from "../index.js";

const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

tape(`fin(action) is called after iterations over all available data`, async (test) => {
  let error, count = 0;
  const f = agen.fin((e, c) => { error = e; count = c; });
  const it = toAsyncIterator(list);
  for await (let v of f(it)) { }
  test.equal(error, undefined);
  test.equal(count, list.length);
});

tape(`fin(action) is called after interrupted iterations`, async (test) => {
  let error, count = 0;
  const f = agen.fin((e, c) => { error = e; count = c; });
  const it = toAsyncIterator(list);
  let idx = 0;
  for await (let v of f(it)) {
    if (++idx === 5) break;
  }
  test.equal(error, undefined);
  test.equal(count, idx);
});

tape(`fin(action) is called after execeptions throw by values provider`, async (test) => {
  let catchedError, error, count = 0;
  const f = agen.fin((e, c) => { error = e; count = c; });
  const breakIdx = 5;
  const it = toAsyncIterator(list, (value, idx) => {
    if (idx === breakIdx) throw new Error('Hello, world');
  });
  let idx = 0;
  try {
    for await (let v of f(it)) { }
  } catch (e) {
    catchedError = e;
  }
  test.equal(error, catchedError);
  test.equal(count, breakIdx);
});

tape(`fin(action) is called after execeptions throw by the caller (consumer)`, async (test) => {
  let error, count = 0;
  const f = agen.fin((e, c) => { error = e; count = c; });
  const breakIdx = 5;
  const it = toAsyncIterator(list);
  let idx = 0;
  try {
    for await (let v of f(it)) {
      idx++;
      if (idx === breakIdx) throw new Error('Hello, world');
    }
  } catch (e) {
  }
  test.equal(error, undefined); // Client's errors are not notified to the producer
  test.equal(count, breakIdx);
});


async function* toAsyncIterator(list, action) {
  let idx = 0;
  for (let value of list) {
    action && (await action(value, idx++));
    yield value;
    await new Promise(r => setTimeout(r, 5));
  }
}