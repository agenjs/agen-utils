import { describe, it, expect } from "./deps.ts";
import { filter, map, compose } from "../src/index.ts";

describe("compose(...methods)", async () => {
  it("transforms a sequence of async generators to one", async () => {
    const f = compose<string>(
      filter((v: string, i: number) => i % 2 == 0), // Filter values
      map((v: string, i: number) => v.toUpperCase()) // Transforms characters
    );
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const traces: string[] = [];
    for await (let v of f(list)) {
      traces.push(v);
    }
    expect(traces).toEqual(["A", "C", "E", "G", "I", "K"]);
  });
});
