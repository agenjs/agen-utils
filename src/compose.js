export default function compose(...list) {
  return async function* (it = [], ...args) {
    yield* list.reduce((it, f) => (f ? f(it, ...args) : it), it);
  }
}