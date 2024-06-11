export default function newSkipQueue() {
  let s, slot;
  return {
    shift: () => ((s = slot), (slot = undefined), s),
    push: (s) => (slot && slot.notify && slot.notify(false), (slot = s)),
  };
}
