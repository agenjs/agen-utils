import { describe, it, expect } from "./deps.ts";
import agen from "../index.ts";

describe("listen(...)", () => {
  it("should notify about all iterated value", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      const results: string[] = [];
      const cleanup = agen.listen<string>(strings, (v: string) =>
        results.push(v)
      );
      await new Promise((r) => setTimeout(r, 10));
      await cleanup();
      expect(results).toEqual(control);
    }
  });
});
