export default function range(from = 0, count = Infinity) {
  return async function* (it) {
    let idx = 0;
    if (count <= 0) return ;
    for await (let value of await it) {
      if (idx >= from) (yield value);
      idx++;
      if (idx >= from + count) break;
    }
  }
}