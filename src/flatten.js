import asIterator from './asIterator.js';

export default function flatten() {
  return async function* exp(it, ...args) {
    let sit;
    for await (let value of await it) {
      if ((sit = asIterator(value))) { yield* exp(sit, ...args); }
      else { yield value; }
    }
  }
}