export default function asIterator(value) {
  if (typeof value === "function") value = value();
  if ((value === null) || (typeof value !== "object")) {
    value = [value];
  }
  return value[Symbol.asyncIterator]
    ? value[Symbol.asyncIterator]()
    : value[Symbol.iterator]
    ? value[Symbol.iterator]()
    : [value][Symbol.iterator]();
}
