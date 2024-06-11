import { describe, it, expect } from "./deps.ts";
import * as agen from "../src/index.ts";

describe("flatten()", () => {
  it("transforms embedded iterables to a flat stream of elements", async () => {
    const f = agen.flatten<string>();
    const list = [
      "a",
      ["b", [["c", "d"], [["e"]], "f"], "g"],
      ["h", [["i"], "j"], "k"],
    ];
    const control = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const traces: string[] = [];
    for await (let v of f(list)) {
      traces.push(v);
    }
    expect(traces).toEqual(control);
  });
});
