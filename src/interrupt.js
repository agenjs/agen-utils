export default function interrupt(before, after) {
  return async function* (it, ...args) {
    let idx = 0;
    for await (let value of it) {
      if (before && await before(value, idx, ...args)) break;
      yield value;
      if (after && await after(value, idx, ...args)) break;
      idx++;
    }
  }
}