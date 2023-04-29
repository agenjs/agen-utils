import iterator from "./iterator.js";
import listen from "./listen.js";

export default function multiplexer(it, newQueue) {
  let list = [], complete;
  return async function* () {
    if (!list) throw new Error("Iterations finished");
    yield* iterator((observer) => {
      if (list.length === 0) {
        const forAll = async (action) => Promise.all(list.map(action));
        complete = listen(it, {
          next: async (v) => await forAll((o) => o.next(v)),
          complete: async () => await forAll((o) => o.complete()),
          error: async (e) => await forAll((o) => o.error(e)),
        });
      }
      list.push(observer);
      return () => {
        list = list.filter((o) => observer !== o);
        if (list.length === 0) {
          list = null;
          complete();
        }
      };
    }, newQueue)();
  };
}
