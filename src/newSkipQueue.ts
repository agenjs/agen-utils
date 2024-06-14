export function newSkipQueue<T = any>() {
  let s, slot: T | undefined;
  return {
    shift: () => ((s = slot), (slot = undefined), s),
    push: (s: T) => {
      slot && (slot as any).notify?.(false);
      slot = s;
    },
  };
}
