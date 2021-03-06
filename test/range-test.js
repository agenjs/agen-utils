import tape from "tape-await";
import agen from "../index.js";

const list = ['a', 'd', 'e', 'f', 'g', 'k', 'l', 'm', 'p'];

tape(`check that range don't consume values out of the scope`, async (t) => {
  let lastIndex = 0;
  const provider = async function*() {
    while (lastIndex < list.length) {
      yield list[lastIndex++];
    }
  }
  const from = 2;
  const count = 3;
  let idx = 0;
  const f = agen.range(from, count);
  for await (let value of f(provider())) {
    t.deepEqual(value, list[from + idx]);
    idx++;
  }
  t.equal(idx, count);
  t.equal(lastIndex, from + count);
})

test(`range sync: should be able to return zero values (1)`, list, 5, 0, []);
test(`range sync: should be able to return zero values (2)`, list, 0, 0, []);
test(`range sync: should be able to return one value (1)`, list, list.length - 1, 1, ['p']);
test(`range sync: should be able to return one value (2)`, list, 0, 1, ['a']);
test(`range sync: should be able to return range from the end`, list, 0, 1000, list);
test(`range sync: should be able to return a slice of the list`, list, 3, 4, list.slice(3, 3 + 4));
test(`range sync: should be able to return 3 values`, list,  list.length - 3, 3, ['l', 'm', 'p'])
test(`range sync: should be able to return all values`, list, 0, 1000, list)

test(`range async: should be able to return zero values (1)`, toAsyncGenerator(list), 5, 0, []);
test(`range async: should be able to return zero values (2)`, toAsyncGenerator(list), 0, 0, []);
test(`range async: should be able to return one value (1)`, toAsyncGenerator(list), list.length - 1, 1, ['p']);
test(`range async: should be able to return one value (2)`, toAsyncGenerator(list), 0, 1, ['a']);
test(`range async: should be able to return one value (3)`, toAsyncGenerator(list), 3, 1, ['f']);
test(`range async: should be able to return range from the end`, toAsyncGenerator(list), 0, 1000, list);
test(`range async: should be able to return a slice of the list`, toAsyncGenerator(list), 3, 4, list.slice(3, 3 + 4));
test(`range async: should be able to return 3 values`, toAsyncGenerator(list),  list.length - 3, 3, ['l', 'm', 'p'])
test(`range async: should be able to return all values`, toAsyncGenerator(list), 0, 1000, list)

function test(msg, list, idx, count, control) {
  tape(msg, async (t) => {
    const result = [];
    const f = agen.range(idx, count);
    for await (let n of f(list)) {
      result.push(n);
    }
    t.deepEqual(result, control);
  })
}

async function* toAsyncGenerator(list, maxTimeout = 10) {
  for await (let item of list) {
    await new Promise(r => setTimeout(r, Math.round(maxTimeout * Math.random())));
    yield item;
  }
}
