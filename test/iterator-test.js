import tape from "tape-await";
import agen from "../index.js";

runTests();

function runTests() {
  tape(
    `iterator(o) [without callbacks] should iterate over non-synchronized values`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let f = agen.iterator((o) => {
          for (let str of strings) {
            o.next(str);
          }
          o.complete();
        });
        let list = [];
        for await (let str of f()) {
          list.push(str);
        }
        t.deepEqual(list, control);
      }
    },
  );

  tape(
    `iterator(o) [without callbacks]  - should iterate over async values without waiting for consumer`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let f = agen.iterator((o) => {
          (async () => {
            for (let str of strings) {
              // Don't wait for the consumer
              o.next(str);
              await new Promise((r) => setTimeout(r, Math.random() * 10));
            }
            o.complete();
          })();
        });

        let list = [];
        for await (let str of f()) {
          list.push(str);
        }
        t.deepEqual(list, control);
      }
    },
  );

  tape(
    `iterator(o) [without callbacks]  - should iterate wity async provider and async consumer`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let f = agen.iterator((o) => {
          (async () => {
            for (let str of strings) {
              // Don't wait for the consumer
              o.next(str);
              await new Promise((r) => setTimeout(r, Math.random() * 10));
            }
            o.complete();
          })();
        });

        let list = [];
        for await (let str of f()) {
          list.push(str);
          await new Promise((r) => setTimeout(r, Math.random() * 10));
        }
        t.deepEqual(list, control);
      }
    },
  );

  tape(
    `iterator(o) [without callbacks]  - should iterate with syncrhonization between provider and consumer`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let f = agen.iterator((o) => {
          (async () => {
            for (let str of strings) {
              // Wait for the consumer
              await o.next(str);
              await new Promise((r) => setTimeout(r, Math.random() * 10));
            }
            await o.complete();
          })();
        });

        let list = [];
        for await (let str of f()) {
          list.push(str);
          await new Promise((r) => setTimeout(r, Math.random() * 10));
        }
        t.deepEqual(list, control);
      }
    },
  );

  tape(
    `iterator(o) [wit callbacks] should iterate over non-synchronized values`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let notified = false;
        let f = agen.iterator((o) => {
          for (let str of strings) {
            o.next(str);
          }
          o.complete();
          return () => notified = true;
        });
        let list = [];
        for await (let str of f()) {
          list.push(str);
        }
        t.deepEqual(list, control);
        t.equal(notified, true);
      }
    },
  );

  tape(
    `should iterate over async values without waiting for consumer`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let notified = false;
        let f = agen.iterator((o) => {
          (async () => {
            for (let str of strings) {
              // Don't wait for the consumer
              o.next(str);
              await new Promise((r) => setTimeout(r, Math.random() * 10));
            }
            o.complete();
          })();
          return () => notified = true;
        });

        let list = [];
        for await (let str of f()) {
          list.push(str);
        }
        t.deepEqual(list, control);
        t.equal(notified, true);
      }
    },
  );

  tape(`should iterate wity async provider and async consumer`, async (t) => {
    await test([], []);
    await test([""], [""]);
    await test(["a"], ["a"]);
    await test(["a", "b", "c"], ["a", "b", "c"]);
    await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
    async function test(strings, control) {
      let notified = false;
      let f = agen.iterator((o) => {
        (async () => {
          for (let str of strings) {
            // Don't wait for the consumer
            o.next(str);
            await new Promise((r) => setTimeout(r, Math.random() * 10));
          }
          o.complete();
        })();
        return () => notified = true;
      });

      let list = [];
      for await (let str of f()) {
        list.push(str);
        await new Promise((r) => setTimeout(r, Math.random() * 10));
      }
      t.deepEqual(list, control);
      t.equal(notified, true);
    }
  });

  tape(
    `should iterate with syncrhonization between provider and consumer`,
    async (t) => {
      await test([], []);
      await test([""], [""]);
      await test(["a"], ["a"]);
      await test(["a", "b", "c"], ["a", "b", "c"]);
      await test(["a", "b", "c", "d", "d"], ["a", "b", "c", "d", "d"]);
      async function test(strings, control) {
        let notified = false;
        let f = agen.iterator((o) => {
          (async () => {
            for (let str of strings) {
              // Wait for the consumer
              await o.next(str);
              await new Promise((r) => setTimeout(r, Math.random() * 10));
            }
            await o.complete();
          })();
          return () => notified = true;
        });

        let list = [];
        for await (let str of f()) {
          list.push(str);
          await new Promise((r) => setTimeout(r, Math.random() * 10));
        }
        t.deepEqual(list, control);
        t.equal(notified, true);
      }
    },
  );
}
