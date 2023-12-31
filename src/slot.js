import compose from "./compose.js";
import fin from "./fin.js";
import iterator from "./iterator.js";
import multiplexer from "./multiplexer.js";
import newSkipQueue from "./newSkipQueue.js";

export default function slot(value, newQueue = newSkipQueue) {
  let resolve,
    reject,
    promise = new Promise((y, n) => ((resolve = y), (reject = n)));
  let observer;
  const f = multiplexer(
    compose(
      iterator((o) => (observer = o), newQueue),
      fin((error) => (error ? reject(error) : resolve())),
    ),
    newQueue,
  );
  async function* values(filter = (v) => v) {
    for await (let value of f()) {
      yield await filter(value);
    }
  }
  values.promise = promise;
  Object.assign(values, observer, {
    next: (v) => observer.next(value = v),
  });
  Object.defineProperty(values, "value", {
    get: () => value,
    set: (v) => {
      values.next(v);
    },
  });
  (value !== undefined) && values.next(value);
  return values;
}
