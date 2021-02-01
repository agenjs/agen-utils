import filter from './filter.js';

export default function range(from, count) {
  if (isNaN(count)) { count = from; from = 0; }
  return filter((value, idx) => (idx >= from && idx < from + count));
}