import { describe, it, expect } from "./deps.js";
import agen from "../index.js";

describe("batch(size)", async () => {
  it("should transform sequence of elements to batches", async () => {
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const results = [
      ["a", "b", "c"],
      ["d", "e", "f"],
      ["g", "h", "i"],
      ["j", "k"],
    ];
    let i = 0;
    const f = agen.batch(3);
    for await (let b of f(list)) {
      expect(b).toEqual(results[i++]);
    }
  });
});