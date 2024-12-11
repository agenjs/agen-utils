import {
  type IterableLike,
  type ObserverLike,
  toObserver,
  toAsyncIterator,
} from "./types.ts";

export function listen<T, E = Error>(
  params: IterableLike<T> | (() => IterableLike<T>),
  observer: ObserverLike<T, E>,
): () => void {
  let finalize: undefined | (() => void);
  const end = new Promise<{ done: boolean; value?: T }>(
    (r) => (finalize = () => r({ done: true })),
  );
  (async () => {
    const o = toObserver<T, E>(observer);
    let error: E | undefined;
    try {
      const it = toAsyncIterator<T>(params);
      let finished = false;
      end.finally(() => {
        finished = true;
        it?.return?.(void 0);
      });
      while (!finished) {
        const { done, value } = await Promise.race([it.next(), end]);
        if (done) break;
        await o.next(value as T);
      }
    } catch (e) {
      error = e as E;
    } finally {
      if (error) {
        o.error && (await o.error(error));
      } else {
        o.complete && (await o.complete());
      }
    }
  })();
  return () => {
    finalize?.();
  };
}
