export default function map(f) {
  return async function* (it, ...args) {
    let idx = 0;
    for await (let value of await it) {
      yield await f(value, idx++, ...args);
    }
  }
}
