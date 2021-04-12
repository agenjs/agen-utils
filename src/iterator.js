export default function iterator(init, newQueue = (() => [])) {
  return async function* (...args) {
    const queue = newQueue();
    let promise, notify, push = async (error, value, done) => {
      const slot = { error, value, done };
      slot.promise = new Promise(n => slot.notify = n);
      await queue.push(slot);
      notify && notify();
      notify = null;
      return slot.promise;
    }
    const unsubscribe = init({
      next: (value) => push(undefined, value, false),
      complete: () => push(undefined, undefined, true),
      error: err => push(err, undefined, true)
    }, ...args);

    let slot;
    try {
      while (true) {
        slot = await queue.shift();
        if (slot) {
          try {
            if (slot.error) { throw slot.error; }
            else if (slot.done) { break; }
            else { yield slot.value; }
          } finally {
            slot.notify(true);
          }
        } else {
          await (promise = notify ? promise : new Promise(n => notify = n));
        }
      }
    } finally {
      notify && notify();
      push = () => false; // Stop pushing in the queue...
      ((typeof unsubscribe === 'function') && (await unsubscribe()));
      while (slot = await queue.shift()) { slot.notify(false); }
    }
  }
}