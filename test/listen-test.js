import tape from "tape-await";
import agen from "../index.js";

tape(`listen should notify about all iterated value`, async (t) => {
  await test([], []);
  await test([''], ['']);
  await test(['a'], ['a']);
  await test(['a', 'b', 'c'], ['a', 'b', 'c']);
  await test(['a', 'b', 'c', 'd', 'd'], ['a', 'b', 'c', 'd', 'd']);
  async function test(strings, control) {
    const results = [];
    const cleanup = agen.listen(strings, (v) => results.push(v));
    await new Promise(r => setTimeout(r, 10));
    await cleanup();
    t.deepEqual(results, control);
  }
})