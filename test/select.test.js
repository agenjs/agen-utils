import { describe, it, expect } from "./deps.js";
import agen from "../index.js";
describe("select", () => {
  it("should be able to create a new slot using an array of iterators", async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select(
      [firstName, lastName],
      ([first = "", last = ""]) => {
        return `${first} ${last}`;
      }
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
  });

  it("should be able to create a new slot using objects with iterator values", async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select(
      {
        firstName,
        lastName,
      },
      (o) => `${o.firstName} ${o.lastName}`
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
  });

  it("should be able to update values when one of the original iterators change its value", async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select(
      {
        firstName,
        lastName,
      },
      (o) => `${o.firstName} ${o.lastName}`
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");

    await firstName.next("JOHN");
    expect(fullName.value).toBe("JOHN Smith");

    await lastName.next("SMITH");
    expect(fullName.value).toBe("JOHN SMITH");
  });

  it("should be able to listen slots with transformation functions", async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select(
      {
        firstName,
        lastName,
      },
      (o) => `${o.firstName} ${o.lastName}`
    );

    const values = [];
    const cleanup = agen.listen(
      fullName((s) => `*${(s || "").toUpperCase()}*`),
      (v) => {
        values.push(v);
      }
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
    expect(values).toEqual(["*JOHN SMITH*"]);
    cleanup();
  });
});
