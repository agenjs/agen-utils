// import {  } from "../../agen-utils/dist/index";
import { describe, it, expect } from "./deps.ts";
import { IterableLike, slot, toAsyncIterator } from "../src/index.ts";

export type Dependencies = Record<string, any> | (() => Record<string, any>);

function newService<T>(): [
  read: <R = (T | undefined)[]>(
    filter?: (value: (T | undefined)[]) => R
  ) => AsyncGenerator<R>,
  write: (values: IterableLike<T>) => () => void,
] {
  let idCounter = 0;
  const values: Record<number, T | undefined> = {};
  const iterators: Record<number, AsyncGenerator<T | undefined>> = {};

  const s = slot<(T | undefined)[]>([]);
  async function* read<R = (T | undefined)[]>(
    filter: (value: (T | undefined)[]) => R = (value) => value as R
  ): AsyncGenerator<R> {
    for await (const value of s()) {
      yield filter(value) as R;
    }
  }
  function write(gen: IterableLike<T>) {
    const it = toAsyncIterator(gen);
    const id = idCounter++;
    values[id] = undefined;
    iterators[id] = it;
    (async () => {
      try {
        for await (const value of it) {
          values[id] = value;
          s.value = Object.values(values);
        }
      } finally {
        delete values[id];
        delete iterators[id];
        s.value = Object.values(values);
      }
    })();
    return () => {
      it?.return?.(void 0);
    };
  }
  return [read, write];
}

function toAsync<T = any>(
  values: T[],
  promises: Promise<unknown>[] = [],
  timeout: number | (() => number) = 15
): () => AsyncGenerator<T> {
  const t = typeof timeout === "number" ? () => timeout : timeout;
  let resolve: () => void = () => {};
  promises.push(new Promise<void>((r) => (resolve = r)));
  return async function* () {
    try {
      for await (const value of values) {
        await (yield value);
        await new Promise((resolve) => {
          setTimeout(resolve, t());
        });
      }
    } finally {
      resolve();
    }
  };
}
describe("newServices", () => {
  async function testServices(
    array: string[][],
    controls: (string | undefined)[][]
  ) {
    const [read, write] = newService<string>();
    const promises: Promise<unknown>[] = [];
    const cleanupList = array.map((values) =>
      write(toAsyncIterator(toAsync(values, promises)))
    );
    const finish = Promise.all(promises);
    const results: (string | undefined)[][] = [];
    try {
      (async () => {
        let i = 0;
        for await (const values of read()) {
          i++;
          results.push(values);
        }
      })();
      await finish;
      // Await the notification for the last (empty) service array
      await new Promise((r) => setTimeout(r, 10));
      expect(results).toEqual(controls);
    } catch (e) {
      console.log(JSON.stringify(results, undefined, 2));
      throw e;
    } finally {
      cleanupList.forEach((cleanup) => cleanup());
    }
  }

  it("should work with a single service provider", async () => {
    await testServices([], [[]]);
    await testServices([["a"]], [[], ["a"], []]);
    await testServices([["a", "b", "c"]], [[], ["a"], ["b"], ["c"], []]);
  });

  it("should work with multiple service providers", async () => {
    await testServices(
      [
        ["a1", "b1", "c1"],
        ["a2", "b2", "c2"],
        ["a3", "b3", "c3"],
      ],
      [
        [],
        ["a1", "a2", "a3"],
        ["b1", "a2", "a3"],
        ["b1", "b2", "a3"],
        ["b1", "b2", "b3"],
        ["c1", "b2", "b3"],
        ["c1", "c2", "b3"],
        ["c1", "c2", "c3"],
        ["c2", "c3"],
        ["c3"],
        [],
      ]
    );
    await testServices(
      [
        ["a1", "a2", "a3"],
        ["b1", "b2", "b3"],
        ["c1", "c2", "c3"],
      ],
      [
        [],
        ["a1", "b1", "c1"],
        ["a2", "b1", "c1"],
        ["a2", "b2", "c1"],
        ["a2", "b2", "c2"],
        ["a3", "b2", "c2"],
        ["a3", "b3", "c2"],
        ["a3", "b3", "c3"],
        ["b3", "c3"],
        ["c3"],
        [],
      ]
    );
  });
});
