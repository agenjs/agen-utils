import * as agen from "../dist/index.js";

// Generate new values:
async function* toAsyncIterator(list, delay = 100) {
  for await (const value of list) {
    yield value;
    await new Promise((r) => setTimeout(r, delay));
  }
}

const iterator = toAsyncIterator(["Hello", "World", "!"]);
const f = agen.multiplexer(iterator);

// Consume values in three different "threads".

// First consumer (the slowest one):
(async () => {
  for await (let value of f()) {
    console.log("* FIRST:", value);
    await new Promise((r) => setTimeout(r, 300));
  }
})();

// Second consumer:
(async () => {
  for await (let value of f()) {
    console.log("* SECOND:", value);
  }
})();

// Third consumer:
(async () => {
  for await (let value of f()) {
    console.log("* THIRD:", value);
  }
})();
// Output:
// * FIRST: Hello
// * SECOND: Hello
// * THIRD: Hello
// * FIRST: World
// * SECOND: World
// * THIRD: World
// * FIRST: !
// * SECOND: !
// * THIRD: !
