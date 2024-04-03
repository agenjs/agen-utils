import { describe, it, expect } from "./deps.js";
import agen from "../index.js";

describe("compose(...methods)", async () => {
  it("transforms a sequence of async generators to one", async () => {
    const f = agen.compose(
      agen.filter((v, i) => i % 2 == 0), // Filter values
      agen.map((v, i) => v.toUpperCase()) // Transforms characters
    );
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const traces = [];
    for await (let v of f(list)) {
      traces.push(v);
    }
    expect(traces).toEqual(["A", "C", "E", "G", "I", "K"]);
  });
});
