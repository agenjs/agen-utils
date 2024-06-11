import { describe, it, expect } from "./deps.ts";
import agen from "../index.ts";

describe("each(before, after)", () => {
  it("sync each(before, after) returns a generator performing additional actions before and after each item", async () => {
    const traces = [];
    const f = agen.each(
      (v, i) => traces.push(`- before [${i}:${v}]`),
      (v, i) => traces.push(`- after [${i}:${v}]`)
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
    const randomPause = async (t) => await new Promise((r) => setTimeout(r, t));
    const f = agen.each(
      async (v, i) => {
        await randomPause(20);
        traces.push(`- before [${i}:${v}]`);
      },
      async (v, i) => {
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
    const randomPause = async (t) => await new Promise((r) => setTimeout(r, t));
    const f = agen.each(
      async (v, i) => {
        await randomPause(20);
        traces.push(`- before [${i}:${v}]`);
      },
      async (v, i) => {
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
    const f = agen.compose(
      agen.filter((_, i) => i % 2 == 0), // Filter only even values
      agen.each(
        // Prints "xml" tags
        (v) => result.push(`<${v}>`),
        (v) => result.push(`</${v}>`)
      ),
      agen.map((v, i) => v.toUpperCase()) // Transforms characters to upper case
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
