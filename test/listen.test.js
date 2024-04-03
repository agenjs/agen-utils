import { describe, it, expect } from "./deps.js";
import agen from "../index.js";

describe("listen(...)", () => {
  it("should notify about all iterated value", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings, control) {
      const results = [];
      const cleanup = agen.listen(strings, (v) => results.push(v));
      await new Promise((r) => setTimeout(r, 10));
      await cleanup();
      expect(results).toEqual(control);
    }
  });
});
