import asIterator from "./asIterator.js";

export default function listen(it, observer) {
  let done = false;
  (async () => {
    try {
      it = asIterator(it)
      if (typeof observer === "function") {
        observer = { next: observer };
      }
      let slot;
      while (!done && (slot = await it.next())) {
        if (done || slot.done) break;
        await observer.next(await slot.value);
      }
      observer.complete && await observer.complete();
    } catch (error) {
      observer.error && await observer.error(error);
    }
  })();
  return () => {
    done = true;
    it.return && it.return();
  };
}
