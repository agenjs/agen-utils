import asIterator from "./asIterator.js";

export default function series(split) {
  return async function* (values) {
    const it = asIterator(values);
    if (!it) return;
    let error,
      slot,
      counter = -1;
    try {
      while (!slot || !slot.done) {
        yield chunk();
      }
    } catch (err) {
      error = err;
      throw err;
    } finally {
      if (error) {
        it.throw && (await it.throw(error));
      } else {
        it.return && (await it.return());
      }
    }
    async function* chunk() {
      while (!slot || !slot.done) {
        if (slot) yield slot.value;
        slot = await it.next();
        counter++;
        if (slot.done || !!(await split(slot.value, counter))) break;
      }
    }
  };
}
