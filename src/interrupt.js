export default function interrupt(before, after) {
  return async function* (it) {
    let idx = 0;
    for await (let value of it) {
      if (before && await before(value, idx)) break;
      yield value;
      if (after && await after(value, idx)) break;
      idx++;
    }
  }
}