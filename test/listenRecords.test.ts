import { describe, it, expect } from "./deps.ts";
import { type IterableLike, iterate, listenRecords } from "../src/index.ts";

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
        a: ["A"],
        b: [],
      },
      []
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
    await test(
      {
        a: ["A1", "A2"],
        b: ["B1", "B2", "B3"],
        c: ["C1", "C2", "C3", "C4"],
      },
      [
        { a: "A1", b: "B1", c: "C1" },
        { a: "A2", b: "B1", c: "C1" },
        { a: "A2", b: "B2", c: "C1" },
        { a: "A2", b: "B2", c: "C2" },
        { a: "A2", b: "B3", c: "C2" },
        { a: "A2", b: "B3", c: "C3" },
        { a: "A2", b: "B3", c: "C4" },
      ]
    );
    await testIterations(
      {
        a: ["A1", "A2"],
        b: ["B1", "B2", "B3"],
        c: ["C1", "C2", "C3", "C4"],
      },
      [
        { a: "A1", b: "B1", c: "C1" },
        { a: "A2", b: "B1", c: "C1" },
        { a: "A2", b: "B2", c: "C1" },
        { a: "A2", b: "B2", c: "C2" },
        { a: "A2", b: "B3", c: "C2" },
        { a: "A2", b: "B3", c: "C3" },
        { a: "A2", b: "B3", c: "C4" },
      ]
    );

    async function test(
      mapping: Record<string, string[]>,
      control: Record<string, string>[]
    ) {
      const results: Record<string, string>[] = [];
      const [iterators, promise] = asIteatorsMapWithPromise(mapping);
      const cleanup = listenRecords<Record<string, string>>(iterators, (v) => {
        results.push(v);
      });
      await promise;
      cleanup();
      expect(results).toEqual(control);
    }
  });

  async function testIterations(
    mapping: Record<string, string[]>,
    control: Record<string, string>[]
  ) {
    const results: Record<string, string>[] = [];
    const [iterators, invalidation] = asIteatorsMapWithPromise(mapping);
    const it = iterate<Record<string, string>>((o) => {
      invalidation && invalidation.then(o.complete, o.error);
      return listenRecords<Record<string, string>>(iterators, o.next);
    });

    for await (const v of it) {
      results.push(v);
    }
    expect(results).toEqual(control);
  }

  function asIteatorsMapWithPromise<T>(
    map: Record<string, T[]>,
    delay?: number | (() => number)
  ): [Record<string, IterableLike<T>>, Promise<void>] {
    const promises: Promise<void>[] = [];
    const result: Record<string, IterableLike<T>> = Object.fromEntries(
      Object.entries(map).map(([key, values]) => {
        const [it, promise] = asIteratorWithPromise(values);
        promises.push(promise);
        return [key, it];
      })
    );
    return [result, Promise.all(promises).then(() => {})];
  }

  function asIteratorWithPromise<T>(
    list: T[],
    delay?: number | (() => number)
  ): [AsyncGenerator<T>, Promise<void>] {
    let resolve: () => void = () => {};
    const promise = new Promise<void>((r) => (resolve = r));
    return [toAsyncIteratorWithDelay(list, resolve, delay), promise];
  }

  async function* toAsyncIteratorWithDelay<T>(
    list: T[],
    resolve?: () => void,
    delay: number | (() => number) = 5
  ): AsyncGenerator<T> {
    const t = typeof delay === "number" ? () => delay : delay;
    try {
      for await (const value of list) {
        await new Promise((r) => setTimeout(r, t()));
        yield value;
      }
    } finally {
      resolve && resolve();
    }
  }
});
