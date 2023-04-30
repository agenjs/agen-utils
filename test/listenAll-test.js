import tape from "tape-await";
import agen from "../index.js";

tape(`listenAll should combine multiple iterator`, async (t) => {
  await test([[], []], []);
  await test([[""]], [[""]]);
  await test([["a"]], [["a"]]);
  await test([["a"], ["b"]], [["a", "b"]]);
  await test([["a"], ["b"], ["c"]], [
    ["a", "b", "c"],
  ]);
  await test([["a1", "a2"], ["b"], ["c1", "c2"]], [
    ["a1", "b", "c1"],
    [
      "a2",
      "b",
      "c1",
    ],
    ["a2", "b", "c2"],
  ]);

  async function test(lists, control) {
    const results = [];
    const cleanup = agen.listenAll(
      lists.map(toAsyncIterator),
      (v) => results.push(v),
    );
    await new Promise((r) => setTimeout(r, 100));
    await cleanup();
    t.deepEqual(results, control);
  }
});

async function* toAsyncIterator(list, delay = 10) {
  for await (const value of list) {
    await new Promise((r) => setTimeout(r, Math.round(Math.random(delay))));
    yield value;
  }
}
