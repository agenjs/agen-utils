import iterator from "./iterator.js";

export default function multiplexer(it, newQueue) {
  let list = [];
  const start = async (o) => {
    list.push(o);
    if (list.length > 1) return;

    const forAll = async (action) => {
      await Promise.all(list.map(action));
    };
    try {
      for await (const value of it) {
        await forAll((o) => o.next(value));
      }
      await forAll((o) => o.complete());
    } catch (error) {
      await forAll((o) => o.error(error));
    } finally {
      list = null;
    }
  };
  const stop = async (o) => {
    list = list.filter((_) => _ !== o);
    if (list.length === 0) {
      it.complete && it.complete();
    }
  };
  return async function* () {
    if (!list) throw new Error("Iterations finished");
    let observer;
    try {
      yield* iterator((o) => {
        start(observer = o);
      }, newQueue)();
    } finally {
      stop(observer);
    }
  };
}
