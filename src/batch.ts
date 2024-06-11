export default function batch(batchSize = 1) {
  return async function* (it) {
    let batch = [];
    for await (let value of await it) {
      batch.push(value);
      if (batch.length === batchSize) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length) yield batch;
  };
}
