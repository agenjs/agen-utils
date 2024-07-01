export function compareArrays<T>(
  first: (T | undefined)[],
  second: (T | undefined)[]
): boolean {
  if (first === second) return true;
  if (first === undefined || second === undefined) return false;
  if (first.length !== second.length) return false;
  for (let i = 0, len = first.length; i < len; i++) {
    if (first[i] !== second[i]) return false;
  }
  return true;
}
