import { describe, it, expect } from "./deps.ts";
import { fin } from "../src/index.ts";
import { toAsyncIterator } from "./test-utils.ts";

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];

describe("fin(action)", () => {
  it("fin(action) is called after iterations over all available data", async () => {
    let error: Error | undefined,
      count = 0;
    const f = fin((e: undefined | Error, c: number) => {
      error = e;
      count = c;
    });
    const it = toAsyncIterator<string>(list);
    for await (let v of f(it)) {
    }
    expect(error).toBe(undefined);
    expect(count).toBe(list.length);
  });

  it("fin(action) is called after interrupted iterations", async () => {
    let error,
      count = 0;
    const f = fin((e: undefined | Error, c: number) => {
      error = e;
      count = c;
    });
    const it = toAsyncIterator(list);
    let idx = 0;
    for await (let v of f(it)) {
      if (++idx === 5) break;
    }
    expect(error).toBe(undefined);
    expect(count).toBe(idx);
  });

  it("fin(action) is called after execeptions throw by values provider", async () => {
    let catchedError: Error | undefined,
      error: Error | undefined,
      count = 0;
    const f = fin((e: undefined | Error, c: number) => {
      error = e;
      count = c;
    });
    const breakIdx = 5;
    const it = toAsyncIterator(list, (value, idx) => {
      if (idx === breakIdx) throw new Error("Hello, world");
    });
    try {
      for await (let v of f(it)) {
      }
    } catch (e) {
      catchedError = e as Error;
    }
    expect(error).toEqual(catchedError);
    expect(count).toBe(breakIdx);
  });

  it("fin(action) is called after execeptions throw by the caller (consumer)", async () => {
    let error: Error | undefined,
      count = 0;
    const f = fin<string>((e: undefined | Error, c: number) => {
      error = e;
      count = c;
    });
    const breakIdx = 5;
    const it = toAsyncIterator(list);
    let idx = 0;
    try {
      for await (let v of f(it)) {
        idx++;
        if (idx === breakIdx) throw new Error("Hello, world");
      }
    } catch (e) {}
    expect(error).toBe(undefined); // Client's errors are not notified to the producer
    expect(count).toBe(breakIdx);
  });
});
