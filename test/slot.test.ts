import { describe, it, expect } from "./deps.ts";
import { slot, } from "../src/index.ts";

describe("slot", () => {
  it("should be an async generator function with the 'value' property", async () => {
    const s = slot("a");
    const AsyncGenerator = async function* () {}.constructor;
    expect(s instanceof AsyncGenerator).toBe(true);
    expect(typeof s).toBe("function");
    expect(s.hasOwnProperty("value")).toBe(true);
    expect(s.value).toBe("a");
  });

  it("should be able to notify the same sequentially value multiple times", async (t) => {
    const array = ["A", "B", "B", "B", "C", "D"];
    const s = slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of s()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of s()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of s()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        s.value = array[i];
        await s.observer.next(array[i]);
      }
      s.observer.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });

  it("should be able to notify multiple listeners using the 'next' method", async (t) => {
    const array = ["A", "B", "C", "D"];
    const s = slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of s()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of s()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of s()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        s.value = array[i];
        await s.observer.next(array[i]);
      }
      s.observer.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });

  it("should be able to notify multiple listeners using the 'value' field", async (t) => {
    const array = ["A", "B", "C", "D"];
    const s = slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of s()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of s()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of s()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        s.value = array[i];
        await new Promise((r) => setTimeout(r, 10));
        // await slot.observer.next(array[i]);
      }
      s.observer.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });
});
