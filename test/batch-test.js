import tape from "tape-await";
import agen from "../index.js";

tape(`batch(size) should transform sequence of elements to batches`, async (test) => {
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const results = [
    ['a', 'b', 'c'],
    ['d', 'e', 'f'],
    ['g', 'h', 'i'],
    ['j', 'k']
  ]
  let i = 0;
  const f = agen.batch(3);
  for await (let b of f(list)) {
    test.deepEqual(b, results[i++]);
  }
})
