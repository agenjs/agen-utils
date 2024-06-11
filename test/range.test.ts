import { describe, it, expect } from "./deps.ts";
import * as agen from "../src/index.ts";
import { toAsyncIterator } from "./test-utils.ts";

const list = ["a", "d", "e", "f", "g", "k", "l", "m", "p"];

describe("range", () => {
  it("check that range don't consume values out of the scope", async () => {
    let lastIndex = 0;
    const provider = async function* () {
      while (lastIndex < list.length) {
        yield list[lastIndex++];
      }
    };
    const from = 2;
    const count = 3;
    let idx = 0;
    const f = agen.range(from, count);
    for await (let value of f(provider())) {
      expect(value).toEqual(list[from + idx]);
      idx++;
    }
    expect(idx).toBe(count);
    expect(lastIndex).toBe(from + count);
  });

  test("range sync: should be able to return zero values (1)", list, 5, 0, []);
  test("range sync: should be able to return zero values (2)", list, 0, 0, []);
  test(
    "range sync: should be able to return one value (1)",
    list,
    list.length - 1,
    1,
    ["p"]
  );
  test("range sync: should be able to return one value (2)", list, 0, 1, ["a"]);
  test(
    "range sync: should be able to return range from the end",
    list,
    0,
    1000,
    list
  );
  test(
    "range sync: should be able to return a slice of the list",
    list,
    3,
    4,
    list.slice(3, 3 + 4)
  );
  test(
    "range sync: should be able to return 3 values",
    list,
    list.length - 3,
    3,
    ["l", "m", "p"]
  );
  test("range sync: should be able to return all values", list, 0, 1000, list);

  test(
    "range async: should be able to return zero values (1)",
    toAsyncIterator(list),
    5,
    0,
    []
  );
  test(
    "range async: should be able to return zero values (2)",
    toAsyncIterator(list),
    0,
    0,
    []
  );
  test(
    "range async: should be able to return one value (1)",
    toAsyncIterator(list),
    list.length - 1,
    1,
    ["p"]
  );
  test(
    "range async: should be able to return one value (2)",
    toAsyncIterator(list),
    0,
    1,
    ["a"]
  );
  test(
    "range async: should be able to return one value (3)",
    toAsyncIterator(list),
    3,
    1,
    ["f"]
  );
  test(
    "range async: should be able to return range from the end",
    toAsyncIterator(list),
    0,
    1000,
    list
  );
  test(
    "range async: should be able to return a slice of the list",
    toAsyncIterator(list),
    3,
    4,
    list.slice(3, 3 + 4)
  );
  test(
    "range async: should be able to return 3 values",
    toAsyncIterator(list),
    list.length - 3,
    3,
    ["l", "m", "p"]
  );
  test(
    "range async: should be able to return all values",
    toAsyncIterator(list),
    0,
    1000,
    list
  );

  function test(
    msg: string,
    list: Iterable<string> | AsyncGenerator<string>,
    idx: number,
    count: number,
    control: string[]
  ) {
    it(msg, async (t) => {
      const result = [];
      const f = agen.range(idx, count);
      for await (let n of f(list)) {
        result.push(n);
      }
      expect(result).toEqual(control);
    });
  }
});
