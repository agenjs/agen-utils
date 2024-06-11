import * as agen from "../dist/index.js";

// Create a new slot with the empty (undefined) value:
const slot = agen.slot();

// Create multiple readers of this slot:

// First reader iterates over values returned by the slot and transforms them to upper case strings.
const firstConsumerPromise = (async () => {
  // This consumer will transform the returned string to upper case:
  const transform = (s = "") => s.toUpperCase();
  for await (const value of slot(transform)) {
    console.log("- First Reader:", value);
  }
})();

// The second consumer transforms string to the lower case:
const secondConsumerPromise = (async () => {
  const transform = (s = "") => s.toLowerCase();
  for await (const value of slot(transform)) {
    console.log("- Second Reader:", value);
  }
})();

// Now we can provide values to the slot:
const providerPromise = (async () => {
  const names = ["James Bond", "John Smith"];
  for (let i = 0; i < names.length; i++) {
    slot.value = names[i];

    // We can also use the `next` function for that.
    // It allows to wait until all consumers handle the provided value.
    //// await slot.next(array[i]);
    await new Promise((r) => setTimeout(r, 10));
  }
  // Call the `complete` method to interrupt iterations
  // for all consumers.
  slot.complete();
})();

Promise.resolve().then(() =>
  Promise.all([firstConsumerPromise, secondConsumerPromise, providerPromise])
);

// Output:
// - First Reader: JAMES BOND
// - Second Reader: james bond
// - First Reader: JOHN SMITH
// - Second Reader: john smith
