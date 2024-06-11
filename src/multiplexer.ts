import iterator from "./iterator.ts";
import listen from "./listen.ts";

export default function multiplexer(it, newQueue, awaitNew) {
  let list = [],
    value,
    error,
    started = false,
    done = false;
  const forAll = async (action) => Promise.all(list.map(action));
  listen(it, {
    next: async (v) => {
      started = true;
      value = v;
      await forAll((o) => o.next(v));
    },
    complete: async () => {
      done = true;
      await forAll((o) => o.complete());
    },
    error: async (e) => {
      error = e;
      done = true;
      await forAll((o) => o.error(e));
    },
  });
  return iterator((observer) => {
    if (done) {
      return error ? observer.error(error) : observer.complete();
    }
    list.push(observer);
    started && !awaitNew && observer.next(value);
    return () => {
      list = list.filter((o) => observer !== o);
    };
  }, newQueue);
}
