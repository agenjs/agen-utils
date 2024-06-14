import { describe, it, expect } from "./deps.ts";
import { map } from "../src/index.ts";

describe("map", () => {
  it("should transform initial elements to new ones", async () => {
    const input = [1, 3, 2, 5, 4];
    const list = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"];
    const control = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"];
    let idx = 0;
    const f = map((v: string, i: number) => v.toUpperCase());
    for await (let item of f(list)) {
      expect(item).toEqual(control[idx++]);
    }
    expect(idx).toEqual(control.length);
  });

  it("should be able to use item index to transform values", async () => {
    const list = ["a", "b", "c"];
    const control = ["A-0", "B-1", "C-2"];
    let idx = 0;
    const f = map((v: string, i: number) => v.toUpperCase() + "-" + i);
    for await (let item of f(list)) {
      expect(item).toEqual(control[idx++]);
    }
    expect(idx).toEqual(control.length);
  });
});
