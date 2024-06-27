export async function* toAsync<T>(
  list: T[],
  delay: number | (() => number) = 5
): AsyncGenerator<T> {
  const t = typeof delay === "number" ? () => delay : delay;
  for await (const value of list) {
    await new Promise((r) => setTimeout(r, t()));
    yield value;
  }
}
