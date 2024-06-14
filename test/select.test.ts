import { describe, it, expect } from "./deps.ts";
import { slot, select, listen } from "../src/index.ts";
describe("select", () => {
  it("should be able to create a new slot using an array of iterators", async (t) => {
    const firstName = slot("John");
    const lastName = slot("Smith");
    const fullName = select<[string, string]>(
      [firstName, lastName],
      ([first = "", last = ""]) => {
        return `${first} ${last}`;
      }
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
  });

  it("should be able to create a new slot using objects with iterator values", async (t) => {
    const firstName = slot("John");
    const lastName = slot("Smith");
    const fullName = select(
      {
        firstName,
        lastName,
      },
      (o: { firstName: string; lastName: string }) =>
        `${o.firstName} ${o.lastName}`
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
  });

  it("should be able to update values when one of the original iterators change its value", async (t) => {
    const firstName = slot("John");
    const lastName = slot("Smith");
    const fullName = select(
      {
        firstName,
        lastName,
      },
      (o: { firstName: string; lastName: string }) =>
        `${o.firstName} ${o.lastName}`
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");

    await firstName.observer.next("JOHN");
    expect(fullName.value).toBe("JOHN Smith");

    await lastName.observer.next("SMITH");
    expect(fullName.value).toBe("JOHN SMITH");
  });

  it("should be able to listen slots with transformation functions", async (t) => {
    const firstName = slot("John");
    const lastName = slot("Smith");
    const fullName = select<
    {
      firstName: string;
      lastName: string;
    },
    string
  >(
      {
        firstName,
        lastName,
      },
      (o: { firstName: string; lastName: string }) =>
        `${o.firstName} ${o.lastName}`
    );

    const values: string[] = [];
    const cleanup = listen(
      fullName((s: string) => `*${(s || "").toUpperCase()}*`),
      (v: string) => {
        values.push(v);
      }
    );
    await new Promise((r) => setTimeout(r, 1));
    expect(fullName.value).toBe("John Smith");
    expect(values).toEqual(["*JOHN SMITH*"]);
    cleanup();
  });
});
