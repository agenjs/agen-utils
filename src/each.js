export default function each(before, after) {
  return async function* (it, ...args) {
    let idx = 0;
    for await (let value of await it) {
      try {
        before && await before(value, idx, ...args);
        await (yield value);
      } finally {
        after && await after(value, idx, ...args);
        idx++;
      }
    }
  }
}