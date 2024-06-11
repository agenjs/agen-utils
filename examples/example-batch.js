import * as agen from "../dist/index.js";

const list = [
  "item-0",
  "item-1",
  "item-2",
  "item-3",
  "item-4",
  "item-5",
  "item-6",
  "item-7",
];
const f = agen.batch(3);
for await (let b of f(list)) {
  console.log("-", b);
}
// Output:
// - ['item-0', 'item-1', 'item-2']
// - ['item-3', 'item-4', 'item-5']
// - ['item-6', 'item-7']
