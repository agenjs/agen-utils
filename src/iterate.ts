import iterator from "./iterator.ts";
export default function iterate(init) {
  return iterator(init)();
}
