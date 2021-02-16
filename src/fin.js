export default function fin(action) {
  return async function* (it) {
    let error, idx = 0
    try {
      for await (let value of it) {
        idx++;
        yield value;
      }
    } catch (err) {
      error = err;
      throw error;
    } finally {
      await action(error, idx);
    }
  }
}