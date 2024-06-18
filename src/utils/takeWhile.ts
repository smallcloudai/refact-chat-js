export function takeWhile<T>(
  arr: T[],
  fun: (a: T) => boolean,
  memo: T[] = [],
): T[] {
  if (arr.length === 0) return memo;
  const [head, ...tail] = arr;
  if (!fun(head)) return memo;
  const nextMemo = [...memo, head];
  return takeWhile(tail, fun, nextMemo);
}
