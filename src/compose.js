export default function compose(...list) {
  return async function* (it = []) {
    yield* list.reduce((it, f) => (f ? f(it) : it), it);
  }
}