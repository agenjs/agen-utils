import tape from "tape-await";
import agen from "../index.js";

tape(`should transform initial elements to new ones`, async (test) => {
  const input = [1, 3, 2, 5, 4];
  const list = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];
  const control = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
  let idx = 0;
  const f = agen.map((v, i) => v.toUpperCase());
  for await (let item of f(list)) {
    test.deepEqual(item, control[idx++]);
  }
  test.deepEqual(idx, control.length);
});

tape(`should be able to use item index to transform values`, async (test) => {
  const list = ['a', 'b', 'c'];
  const control = ['A-0', 'B-1', 'C-2'];
  let idx = 0;
  const f = agen.map((v, i) => v.toUpperCase() + '-' + i);
  for await (let item of f(list)) {
    test.deepEqual(item, control[idx++]);
  }
  test.deepEqual(idx, control.length);
})