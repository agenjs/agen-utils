import { describe, it, expect } from "./deps.ts";
import { multiplexer } from "../src/index.ts";
import { delay, toAsyncIterator } from "./test-utils.ts";

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];

describe("multiplexer()", () => {
  it("multiplexer(init) should add multiple reader for one generator", async () => {
    const it = toAsyncIterator(list);
    const f = multiplexer(it);
    let results = [];
    const promises = [];
    const N = 3;
    for (let i = 0; i < N; i++) {
      const array: string[] = [];
      results.push(array);
      promises.push(
        (async (array) => {
          for await (const value of f()) {
            array.push(value);
            await delay(Math.round(Math.random() * 10));
          }
        })(array)
      );
    }
    await Promise.all(promises);

    const control = Array.from({ length: N }).map((_) => [...list]);
    expect(results).toEqual(control);
  });
});
