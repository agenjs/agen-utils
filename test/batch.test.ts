import { describe, it, expect } from "./deps.ts";
import { batch } from "../src/batch.ts";

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
    const f = batch(3);
    for await (let b of f(list)) {
      expect(b).toEqual(results[i++]);
    }
  });
});
