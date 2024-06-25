import { describe, it, expect } from "./deps.ts";
import { type IterableLike, listenArray } from "../src/index.ts";
import { toAsync } from "./toAsync.ts";

describe("listenArray", () => {
  it("listenArray should combine multiple iterator", async (t) => {
    await test([], []);
    await test([[""]], [[""]]);
    await test([[], ["B1", "B2", "B3"]], []);
    await test([["A"], ["B"]], [["A", "B"]]);
    await test(
      [
        ["A1", "A2"],
        ["B1", "B2", "B3"],
      ],
      [
        ["A1", "B1"],
        ["A2", "B1"],
        ["A2", "B2"],
        ["A2", "B3"],
      ]
    );
    await test(
      [["A1", "A2"], ["B1", "B2", "B3"], ["C1"]],
      [
        ["A1", "B1", "C1"],
        ["A2", "B1", "C1"],
        ["A2", "B2", "C1"],
        ["A2", "B3", "C1"],
      ]
    );

    async function test(sources: string[][], control: string[][]) {
      const results: string[][] = [];
      const iterators: IterableLike<string>[] = sources.map((values) =>
        toAsync(values)
      );
      const cleanup = listenArray<string>(iterators, (v) => {
        results.push(v);
      });
      await new Promise((r) => setTimeout(r, 100));
      cleanup();
      expect(results).toEqual(control);
    }
  });
});
