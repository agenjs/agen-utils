import { describe, it, expect } from "./deps.ts";
import { type Observer, iterate } from "../src/index.ts";

describe("iterate(o)", () => {
  it("iterate(o) [without callbacks] should iterate over non-synchronized values", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      const iterator = iterate((o: Observer) => {
        for (const str of strings) {
          o.next(str);
        }
        o.complete();
      });
      const list = [];
      for await (const str of iterator) {
        list.push(str);
      }
      expect(list).toEqual(control);
    }
  });

  it("iterate(o) [without callbacks]  - should iterate over async values without waiting for consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      const iterator = iterate((o) => {
        (async () => {
          for (const str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
      }
      expect(list).toEqual(control);
    }
  });

  it("iterate(o) [without callbacks]  - should iterate wity async provider and async consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      const iterator = iterate((o) => {
        (async () => {
          for (const str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
    }
  });

  it("iterate(o) [without callbacks]  - should iterate with syncrhonization between provider and consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      const iterator = iterate((o) => {
        (async () => {
          for (const str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
    }
  });

  it("iterate(o) [with callbacks] should iterate over non-synchronized values", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      const iterator = iterate((o) => {
        for (const str of strings) {
          o.next(str);
        }
        o.complete();
        return () => (notified = true);
      });
      const list = [];
      for await (const str of iterator) {
        list.push(str);
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate over async values without waiting for consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      const iterator = iterate((o) => {
        (async () => {
          for (const str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => (notified = true);
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate wity async provider and async consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      const iterator = iterate((o) => {
        (async () => {
          for (const str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => (notified = true);
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate with syncrhonization between provider and consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      const iterator = iterate<string>((o) => {
        (async () => {
          for (const str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
        return () => (notified = true);
      });

      const list = [];
      for await (const str of iterator) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });
});
