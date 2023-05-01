import listen from "./listen.js";

export default function listenAll(generators = [], observer = (v) => v) {
  if (typeof observer === "function") observer = { next: observer };
  let select = (v) => [...v];
  if (!Array.isArray(generators)) {
    const entries = Object.entries(generators);
    generators = entries.map((e) => e[1]);
    const keys = entries.map((e) => e[0]);
    select = (values) =>
      keys.reduce((obj, key, idx) => ((obj[key] = values[idx]), obj), {});
  }
  const values = new Array(generators.length);
  const registrations = generators.map((gen, idx) =>
    listen(gen, {
      next: async (value) => {
        values[idx] = value;
        for (let i = 0; i < values.length; i++) {
          if (values[i] === undefined) return ;
        }
        return await observer.next(select(await Promise.all(values)));
      },
      complete: observer.complete,
      error: observer.error
    })
  );
  return () => registrations.forEach((r) => r());
}