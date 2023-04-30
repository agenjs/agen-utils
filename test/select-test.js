import tape from "tape-await";
import agen from "../index.js";

tape(
  `select - should be able to create a new slot using an array of iterators`,
  async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select(
      [firstName, lastName],
      ([first = "", last = ""]) => {
        return `${first} ${last}`;
      },
    );
    await new Promise((r) => setTimeout(r, 1));
    t.equal(fullName.value, "John Smith");
  },
);

tape(
  `select - should be able to create a new slot using objects with iterator values`,
  async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select({
      firstName,
      lastName,
    }, (o) => `${o.firstName} ${o.lastName}`);
    await new Promise((r) => setTimeout(r, 1));
    t.equal(fullName.value, "John Smith");
  },
);

tape(
  `select - should be able to update values when one of the original iterators change its value`,
  async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select({
      firstName,
      lastName,
    }, (o) => `${o.firstName} ${o.lastName}`);
    await new Promise((r) => setTimeout(r, 1));
    t.equal(fullName.value, "John Smith");

    await firstName.next("JOHN");
    t.equal(fullName.value, "JOHN Smith");

    await lastName.next("SMITH");
    t.equal(fullName.value, "JOHN SMITH");

  },
);

tape(
  `select - should be able to listen slots with transformation functions`,
  async (t) => {
    const firstName = agen.slot("John");
    const lastName = agen.slot("Smith");
    const fullName = agen.select({
      firstName,
      lastName,
    }, (o) => `${o.firstName} ${o.lastName}`);


    const values = [];
    const cleanup = agen.listen(fullName(s => `*${(s||'').toUpperCase()}*`), (v) => {
      values.push(v);
    });
    await new Promise((r) => setTimeout(r, 1));
    t.deepEqual(fullName.value, 'John Smith');
    t.deepEqual(values, ['*JOHN SMITH*'])
    cleanup();
  },
);
