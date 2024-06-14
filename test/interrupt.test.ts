import { describe, it, expect } from "./deps.ts";
import { interrupt } from "../src/index.ts";

describe("interrupt()", () => {
  it("interrupt(before) should interrupt iterations before returning values", async () => {
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    let i = 0;
    const f = interrupt((value: string, idx: number) => idx === 3);
    const result = [];
    for await (let b of f(list)) {
      result.push(b);
    }
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("interrupt(null, after) should interrupt iterations after returning values", async () => {
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const results = ["a", "b", "c", "d"];
    let i = 0;
    const f = interrupt(undefined, (value: string, idx: number) => idx === 3);
    const result = [];
    for await (let b of f(list)) {
      result.push(b);
    }
    expect(result).toEqual(["a", "b", "c", "d"]);
  });
});
