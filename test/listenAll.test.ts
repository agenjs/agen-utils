import { describe, it, expect } from "./deps.ts";
import { IterableLike, listenAll } from "../src/index.ts";

describe("listenAll", () => {
  it("listenAll should combine multiple iterator", async (t) => {
    await test([[], []], []);
    await test([[""]], [[""]]);
    await test([["a"]], [["a"]]);
    await test([["a"], ["b"]], [["a", "b"]]);
    await test([["a"], ["b"], ["c"]], [["a", "b", "c"]]);
    await test(
      [["a1", "a2"], ["b"], ["c1", "c2"]],
      [
        ["a1", "b", "c1"],
        ["a2", "b", "c1"],
        ["a2", "b", "c2"],
      ]
    );

    async function test(lists: string[][], control: string[][]) {
      const results: string[] = [];
      const iterators: IterableLike<string>[] = lists.map(toAsyncIterator);
      const cleanup = listenAll(iterators, (v: string) => {
        results.push(v);
      });
      await new Promise((r) => setTimeout(r, 100));
      await cleanup();
      expect(results).toEqual(control);
    }
  });

  async function* toAsyncIterator<T>(list: T[]): AsyncGenerator<T> {
    const delay: number = 5;
    for await (const value of list) {
      await new Promise((r) => setTimeout(r, delay));
      yield value;
    }
  }
});
