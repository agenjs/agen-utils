import tape from "tape-await";
import agen from "../index.js";

tape(`flatten() transforms embedded iterables to a flat stream of elements`, async (test) => {
  const f = agen.flatten();
  const list = ['a', ['b', [['c', 'd'], [['e']], 'f'], 'g'], ['h', [['i'], 'j'], 'k']];
  const control = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const traces = []
  for await (let v of f(list)) {
    traces.push(v);
  }
  test.deepEqual(traces, control);
});