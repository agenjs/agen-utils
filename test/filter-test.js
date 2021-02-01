import tape from "tape-await";
import agen from "../index.js";

tape(`filter(accept) returns values accepted by the specified function`, async (test) => {
  const f = agen.filter((v, i) => (i % 2 == 0));
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const traces = [];
  for await (let v of f(list)) {
    traces.push(v);
  }
  test.deepEqual(traces, ['a', 'c', 'e', 'g', 'i', 'k']);
});