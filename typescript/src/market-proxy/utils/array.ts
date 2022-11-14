export const sortBy = <T>(arr: T[], prop: keyof T) => {
  const result = [...arr];

  result.sort((a, b) => {
    const propA = typeof a[prop] === 'string' ? (a[prop] as string).toUpperCase() : a[prop];
    const propB = typeof b[prop] === 'string' ? (b[prop] as string).toUpperCase() : b[prop];

    if (propA < propB) {
      return -1;
    }
    if (propA > propB) {
      return 1;
    }

    return 0;
  });

  return result;
};

export const difference = <T, U>(
  arr1: T[],
  arr2: U[],
  compareFn: (item1: T, item2: U) => boolean
) => arr1.filter((item1) => !arr2.find((item2) => compareFn(item1, item2)));
