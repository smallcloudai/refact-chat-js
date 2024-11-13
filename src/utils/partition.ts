function iter<T, A extends T, B extends T = A>(
  array: T[],
  predicate: (a: T) => boolean,
  processed: (A[] | B[])[] = [[], []],
): (A[] | B[])[] {
  if (array.length === 0) return processed;
  const [head, ...tail] = array;
  const [left, right] = processed;

  if (predicate(head)) {
    // const group = [...lastArray, head] as A[];
    const nextRight = [...right, head as B] as B[];

    const next: (A[] | B[])[] = [left, nextRight];

    return iter<T, A, B>(tail, predicate, next);
  }

  const nextLeft = [...left, head] as A[];
  return iter<T, A, B>(tail, predicate, [nextLeft, right]);
}

export function partition<T, A extends T = T, B extends T = A>(
  array: T[],
  condition: (a: T) => boolean,
): (A[] | B[])[] {
  return iter<T, A, B>(array, condition);
}
