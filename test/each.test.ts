import { describe, it, expect } from "./deps.ts";
import { compose, each, map, filter } from "../src/index.ts";

describe("each(before, after)", () => {
  it("sync each(before, after) returns a generator performing additional actions before and after each item", async () => {
    const traces = [];
    const f = each<string>(
      (v: string, i: number) => traces.push(`- before [${i}:${v}]`),
      (v: string, i: number) => traces.push(`- after [${i}:${v}]`)
    );
    const list = ["a", "b", "c"];
    for await (const v of f(list)) {
      traces.push(` - ${v}`);
    }
    expect(traces).toEqual([
      "- before [0:a]",
      " - a",
      "- after [0:a]",
      "- before [1:b]",
      " - b",
      "- after [1:b]",
      "- before [2:c]",
      " - c",
      "- after [2:c]",
    ]);
  });

  it("async each(before, after) returns a generator performing additional actions before and after each item", async () => {
    const traces = [];
    const randomPause = async (t: number) =>
      await new Promise((r) => setTimeout(r, t));
    const f = each(
      async (v: string, i: number) => {
        await randomPause(20);
        traces.push(`- before [${i}:${v}]`);
      },
      async (v: string, i: number) => {
        await randomPause(20);
        traces.push(`- after [${i}:${v}]`);
      }
    );
    const list = ["a", "b", "c"];
    for await (const v of f(list)) {
      traces.push(` - ${v}`);
    }
    expect(traces).toEqual([
      "- before [0:a]",
      " - a",
      "- after [0:a]",
      "- before [1:b]",
      " - b",
      "- after [1:b]",
      "- before [2:c]",
      " - c",
      "- after [2:c]",
    ]);
  });

  it("async each(before, after) returns a generator performing additional actions before and after each item", async () => {
    const traces = [];
    const randomPause = async (t: number) =>
      await new Promise((r) => setTimeout(r, t));
    const f = each(
      async (v: string, i: number) => {
        await randomPause(20);
        traces.push(`- before [${i}:${v}]`);
      },
      async (v: string, i: number) => {
        await randomPause(20);
        traces.push(`- after [${i}:${v}]`);
      }
    );
    const list = ["a", "b", "c"];
    for await (const v of f(list)) {
      traces.push(` - ${v}`);
    }
    expect(traces).toEqual([
      "- before [0:a]",
      " - a",
      "- after [0:a]",
      "- before [1:b]",
      " - b",
      "- after [1:b]",
      "- before [2:c]",
      " - c",
      "- after [2:c]",
    ]);
  });
  it("should finalize iterations", async () => {
    const result = [];

    // compose method allows to combine multiple operations in one:
    const f = compose(
      filter((_: string, i: number) => i % 2 == 0), // Filter only even values
      each(
        // Prints "xml" tags
        (v: string) => result.push(`<${v}>`),
        (v: string) => result.push(`</${v}>`)
      ),
      map((v: string, i: number) => v.toUpperCase()) // Transforms characters to upper case
    );

    // Define the original sequence to transform:
    const list = ["a", "b", "c", "d", "e", "f", "g"];

    // Apply filters:
    for await (const v of f(list)) {
      result.push(` - ${v}`);
      await new Promise((r) => setTimeout(r, 10));
    }
    expect(result).toEqual([
      "<a>",
      " - A",
      "</a>",
      "<c>",
      " - C",
      "</c>",
      "<e>",
      " - E",
      "</e>",
      "<g>",
      " - G",
      "</g>",
    ]);
  });
});
