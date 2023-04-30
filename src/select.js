import listenAll from "./listenAll.js";
import slot from "./slot.js";

export default function select(generators = [], transform = (v) => v) {
  const s = slot();
  s.promise.finally(listenAll(generators, (v) => (s.value = transform(v))));
  return s;
}
