export async function* toAsyncIterator<T>(
  list: T[],
  action?: (value: T, index: number) => void | Promise<void>
): AsyncGenerator<T> {
  let idx = 0;
  for (let value of list) {
    action && (await action(value, idx++));
    yield value;
    await delay(5);
  }
}

export async function delay(timeout = 10) {
  await new Promise((r) => setTimeout(r, timeout));
}
