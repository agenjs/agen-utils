import iterator from "./iterator.js";
export default function iterate(init) {
  return iterator(init)();
}
