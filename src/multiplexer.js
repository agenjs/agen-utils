import iterator from './iterator.js';

export default function multiplexer(init, newQueue) {
  const read = iterator(init, newQueue);
  let list = [];
  const forAll = async (action) => (await Promise.all(list.map(action)));
  (async() => {
    let error;
    try {
      for await (let value of read()) { await forAll((o) => o.next(value)) }
    } catch (err) {
      error = err;
    } finally {
      const f = error ? (o) => o.error(error) : (o) => o.complete();
      try { await forAll(f); } finally { list = null; }
    }
  })();
  return async function* (...args) {
    if (!list) throw new Error('Iterations finished');
    yield* iterator(o => {
      list = [...list, o];
      return () => list = list.filter(_ => _ !== o);
    }, newQueue)(...args);
  }
}