import { describe, it, expect } from "./deps.ts";
import * as agen from "../src/index.ts";

describe("slot", () => {
  it("should be an async generator function with the 'value' property", async () => {
    const slot = agen.slot("a");
    const AsyncGenerator = async function* () {}.constructor;
    expect(slot instanceof AsyncGenerator).toBe(true);
    expect(typeof slot).toBe("function");
    expect(slot.hasOwnProperty("value")).toBe(true);
    expect(slot.value).toBe("a");
  });

  it("should be able to notify the same sequentially value multiple times", async (t) => {
    const array = ["A", "B", "B", "B", "C", "D"];
    const slot = agen.slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of slot()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        slot.value = array[i];
        await slot.next(array[i]);
      }
      slot.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });

  it("should be able to notify multiple listeners using the 'next' method", async (t) => {
    const array = ["A", "B", "C", "D"];
    const slot = agen.slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of slot()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        slot.value = array[i];
        await slot.next(array[i]);
      }
      slot.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });

  it("should be able to notify multiple listeners using the 'value' field", async (t) => {
    const array = ["A", "B", "C", "D"];
    const slot = agen.slot<string>();

    const result1: string[] = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2: string[] = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3: string[] = [];
    let thirdPromise = (async () => {
      for await (const value of slot()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        slot.value = array[i];
        await new Promise((r) => setTimeout(r, 10));
        // await slot.next(array[i]);
      }
      slot.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    expect(result1).toEqual(array);
    expect(result2).toEqual(array);
    expect(result3).toEqual(array);
  });
});
