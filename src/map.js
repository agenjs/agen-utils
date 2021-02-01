export default function map(f) {
  return async function* (it) {
    let idx = 0;
    for await (let value of it) {
      yield await f(value, idx++);
    }
  }
}
