import asIterator from "./asIterator.js";

export default function flatten() {
  return async function* exp(it) {
    it = asIterator(it);
    for await (let value of await it) {
      if (typeof value === "object" && value) {
        yield* exp(value);
      } else {
        yield value;
      }
    }
  };
}
