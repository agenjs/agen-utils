// import {  } from "../../agen-utils/dist/index";
import { describe, it, expect } from "./deps.ts";
import { listenSources, toAsyncIterator } from "../src/index.ts";

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
describe("listenSources", () => {
  async function testSources(
    array: string[][],
    controls: (string | undefined)[][]
  ) {
    const promises: Promise<unknown>[] = [];
    const results: (string | undefined)[][] = [];
    const sources = array.map((values) => toAsync(values, promises)());
    const cleanup = listenSources<string>([sources], (values) => {
      results.push(values);
    });
    const finish = Promise.all(promises);
    try {
      await finish;
      // Await the notification for the last (empty) service array
      await new Promise((r) => setTimeout(r, 10));
      expect(results).toEqual(controls);
    } catch (e) {
      console.log(JSON.stringify(results, undefined, 2));
      throw e;
    } finally {
      cleanup();
    }
  }

  it("should work with a single source", async () => {
    await testSources([], [[]]);
    await testSources([["a"]], [[], ["a"], []]);
    await testSources([["a", "b", "c"]], [[], ["a"], ["b"], ["c"], []]);
  });

  it("should work with multiple sources", async () => {
    await testSources(
      [[], ["a1"], [], ["b1"], [], ["c1"], []],
      [[], ["a1"], ["a1", "b1"], ["a1", "b1", "c1"], ["b1", "c1"], ["c1"], []]
    );
    await testSources(
      [
        ["a1", "a2", "a3"],
        ["b1", "b2", "b3"],
        ["c1", "c2", "c3"],
      ],
      [
        [],
        ["a1"],
        ["a1", "b1"],
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
    await testSources(
      [["a1"], ["b1", "b2"], ["c1", "c2", "c3"]],
      [
        [],
        ["a1"],
        ["a1", "b1"],
        ["a1", "b1", "c1"],
        ["b1", "c1"],
        ["b2", "c1"],
        ["b2", "c2"],
        ["c2"],
        ["c3"],
        [],
      ]
    );
    await testSources(
      [["a1", "a2", "a3"], ["b1", "b2"], ["c1"]],
      [
        [],
        ["a1"],
        ["a1", "b1"],
        ["a1", "b1", "c1"],
        ["a2", "b1", "c1"],
        ["a2", "b2", "c1"],
        ["a2", "b2"],
        ["a3", "b2"],
        ["a3"],
        [],
      ]
    );
  });
});
