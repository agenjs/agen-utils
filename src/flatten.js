import asIterator from './asIterator.js';

export default function flatten() {
  return async function* exp(it) {
    let sit;
    for await (let value of it) {
      if ((sit = asIterator(value))) { yield* exp(sit); }
      else { yield value; }
    }
  }
}