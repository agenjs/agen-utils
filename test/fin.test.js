import { describe, it, expect } from "./deps.ts";
import agen from "../index.ts";

const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];

describe("fin(action)", () => {
  it("fin(action) is called after iterations over all available data", async () => {
    let error,
      count = 0;
    const f = agen.fin((e, c) => {
      error = e;
      count = c;
    });
    const it = toAsyncIterator(list);
    for await (let v of f(it)) {
    }
    expect(error).toBe(undefined);
    expect(count).toBe(list.length);
  });

  it("fin(action) is called after interrupted iterations", async () => {
    let error,
      count = 0;
    const f = agen.fin((e, c) => {
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
    let catchedError,
      error,
      count = 0;
    const f = agen.fin((e, c) => {
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
      catchedError = e;
    }
    expect(error).toEqual(catchedError);
    expect(count).toBe(breakIdx);
  });

  it("fin(action) is called after execeptions throw by the caller (consumer)", async () => {
    let error,
      count = 0;
    const f = agen.fin((e, c) => {
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

async function* toAsyncIterator(list, action) {
  let idx = 0;
  for (let value of list) {
    action && (await action(value, idx++));
    yield value;
    await new Promise((r) => setTimeout(r, 5));
  }
}
