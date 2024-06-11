import { describe, it, expect } from "./deps.ts";
import * as agen from "../src/index.ts";

describe("filter(accept)", () => {
  it("returns values accepted by the specified function", async () => {
    const f = agen.filter((v: string, i: number) => i % 2 == 0);
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const traces = [];
    for await (let v of f(list)) {
      traces.push(v);
    }
    expect(traces).toEqual(["a", "c", "e", "g", "i", "k"]);
  });
});
