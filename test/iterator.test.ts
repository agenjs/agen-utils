import { describe, it, expect } from "./deps.ts";
import * as agen from "../src/index.ts";
import type { Observer } from "@agen/utils";

describe("iterator()", () => {
  it("iterator(o : Observer<string>) [without callbacks] should iterate over non-synchronized values", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let f = agen.iterator((o: Observer<string>) => {
        for (let str of strings) {
          o.next(str);
        }
        o.complete();
      });
      let list = [];
      for await (let str of f()) {
        list.push(str);
      }
      expect(list).toEqual(control);
    }
  });

  it("iterator(o : Observer<string>) [without callbacks]  - should iterate over async values without waiting for consumer", async () => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
      }
      expect(list).toEqual(control);
    }
  });

  it("iterator(o : Observer<string>) [without callbacks]  - should iterate wity async provider and async consumer", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
    }
  });

  it("iterator(o : Observer<string>) [without callbacks]  - should iterate with syncrhonization between provider and consumer", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
    }
  });

  it("iterator(o : Observer<string>) [wit callbacks] should iterate over non-synchronized values", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      let f = agen.iterator((o: Observer<string>) => {
        for (let str of strings) {
          o.next(str);
        }
        o.complete();
        return () => (notified = true);
      });
      let list = [];
      for await (let str of f()) {
        list.push(str);
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate over async values without waiting for consumer", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => (notified = true);
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate wity async provider and async consumer", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => (notified = true);
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });

  it("should iterate with syncrhonization between provider and consumer", async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings: string[], control: string[]) {
      let notified = false;
      let f = agen.iterator((o: Observer<string>) => {
        (async () => {
          for (let str of strings) {
            // Wait for the consumer
            await o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          await o.complete();
        })();
        return () => (notified = true);
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      expect(list).toEqual(control);
      expect(notified).toBe(true);
    }
  });
});
