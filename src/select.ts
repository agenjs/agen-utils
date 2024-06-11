import listenAll from "./listenAll.ts";
import slot from "./slot.ts";

export default function select(generators = [], transform = (v) => v) {
  const s = slot();
  s.promise.finally(listenAll(generators, (v) => (s.value = transform(v))));
  return s;
}
