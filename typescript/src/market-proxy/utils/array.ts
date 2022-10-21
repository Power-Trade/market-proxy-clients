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
