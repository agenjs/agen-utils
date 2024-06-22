import { describe, it, expect } from "./deps.ts";
import { type IterableLike, listenRecords } from "../src/index.ts";

describe("listenRecords", () => {
  it("listenRecords should combine multiple iterator", async (t) => {
    await test({}, []);
    await test(
      {
        a: [""],
      },
      [{ a: "" }]
    );
    await test(
      {
        a: ["A"],
      },
      [{ a: "A" }]
    );
    await test(
      {
        a: ["a"],
        b: ["b"],
      },
      [
        {
          a: "a",
          b: "b",
        },
      ]
    );
    await test(
      {
        a: ["a"],
        b: ["b"],
        c: ["c"],
      },
      [{ a: "a", b: "b", c: "c" }]
    );
    await test(
      {
        a: ["a"],
        b: ["b"],
        c: ["c"],
      },
      [{ a: "a", b: "b", c: "c" }]
    );
    await test(
      {
        a: ["a"],
        b: ["b"],
        c: ["c"],
      },
      [{ a: "a", b: "b", c: "c" }]
    );
    await test(
      {
        a: ["A1", "A2"],
        b: ["B1", "B2"],
        c: ["C1", "C2"],
      },
      [
        { a: "A1", b: "B1", c: "C1" },
        { a: "A2", b: "B1", c: "C1" },
        { a: "A2", b: "B2", c: "C1" },
        { a: "A2", b: "B2", c: "C2" },
      ]
    );

    async function test(
      mapping: Record<string, string[]>,
      control: Record<string, string>[]
    ) {
      const results: Record<string, string>[] = [];
      const iterators: Record<
        string,
        IterableLike<string>
      > = Object.fromEntries(
        Object.entries(mapping).map(([key, values]) => [
          key,
          toAsyncIteratorWithDelay(values),
        ])
      );
      const cleanup = listenRecords<Record<string, string>>(iterators, (v) => {
        results.push(v);
      });
      await new Promise((r) => setTimeout(r, 100));
      await cleanup();
      expect(results).toEqual(control);
    }
  });

  async function* toAsyncIteratorWithDelay<T>(
    list: T[],
    delay: number = 5
  ): AsyncGenerator<T> {
    for await (const value of list) {
      await new Promise((r) => setTimeout(r, delay));
      yield value;
    }
  }
});
