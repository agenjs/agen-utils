export default function asIterator(value) {
  if ((value === null) || (typeof value !== 'object')) return null;
  return value[Symbol.asyncIterator]
    ? value[Symbol.asyncIterator]()
    : value[Symbol.iterator]
      ? value[Symbol.iterator]()
      : null;
}