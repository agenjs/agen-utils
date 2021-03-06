import tape from "tape-await";
import agen from "../index.js";

tape(`interrupt(before) should interrupt iterations before returning values`, async (test) => {
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  let i = 0;
  const f = agen.interrupt((value, idx) => idx === 3);
  const result = [];
  for await (let b of f(list)) {
    result.push(b);
  }
  test.deepEqual(result, ['a', 'b', 'c']);
})

tape(`interrupt(null, after) should interrupt iterations after returning values`, async (test) => {
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const results = ['a', 'b', 'c', 'd']
  let i = 0;
  const f = agen.interrupt(null, (value, idx) => idx === 3);
  const result = [];
  for await (let b of f(list)) {
    result.push(b);
  }
  test.deepEqual(result, ['a', 'b', 'c', 'd']);
})
