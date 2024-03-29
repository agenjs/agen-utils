import tape from "tape-await";
import agen from "../index.js";

tape(
  `slot - should be an async generator function with the 'value' property`,
  async (test) => {
    const slot = agen.slot("a");
    const AsyncGenerator = (async function* () {}).constructor;
    test.equal(slot instanceof AsyncGenerator, true);
    test.equal(typeof slot, "function");
    test.equal(slot.hasOwnProperty("value"), true);
    test.equal(slot.value, "a");
  },
);

tape(
  `slot - should be able to notify the same sequentially value multiple times`,
  async (t) => {
    const array = ["A", "B", "B", "B", "C", "D"];
    const slot = agen.slot();

    const result1 = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2 = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3 = [];
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
    t.deepEqual(result1, array);
    t.deepEqual(result2, array);
    t.deepEqual(result3, array);
  },
);

tape(
  `slot - should be able to notify multiple listeners using the "next" method`,
  async (t) => {
    const array = ["A", "B", "C", "D"];
    const slot = agen.slot();

    const result1 = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2 = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3 = [];
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
    t.deepEqual(result1, array);
    t.deepEqual(result2, array);
    t.deepEqual(result3, array);
  },
);

tape(
  `slot - should be able to notify multiple listeners using the "value" field`,
  async (t) => {
    const array = ["A", "B", "C", "D"];
    const slot = agen.slot();

    const result1 = [];
    let firstPromise = (async () => {
      for await (const value of slot()) {
        result1.push(value);
      }
    })();

    const result2 = [];
    let secondPromise = (async () => {
      for await (const value of slot()) {
        result2.push(value);
      }
    })();

    const result3 = [];
    let thirdPromise = (async () => {
      for await (const value of slot()) {
        result3.push(value);
      }
    })();

    (async () => {
      for (let i = 0; i < array.length; i++) {
        slot.value = array[i];
        await new Promise(r => setTimeout(r, 10));
        // await slot.next(array[i]);
      }
      slot.complete();
    })();

    await Promise.all([firstPromise, secondPromise, thirdPromise]);
    t.deepEqual(result1, array);
    t.deepEqual(result2, array);
    t.deepEqual(result3, array);
  },
);
