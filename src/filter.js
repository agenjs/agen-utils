export default function filter(accept) {
  return async function* (it) {
    let idx = 0;
    for await (let value of await it) {
      if (await accept(value, idx++)) yield value;
    }
  }
}