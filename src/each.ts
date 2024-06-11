export default function each(before, after) {
  return async function* (it) {
    let idx = 0;
    for await (const value of await it) {
      try {
        before && (await before(value, idx));
        await (yield value);
      } finally {
        after && (await after(value, idx));
        idx++;
      }
    }
  };
}
