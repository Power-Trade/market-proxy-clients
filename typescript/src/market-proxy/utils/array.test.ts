import { expect, test, describe } from '@jest/globals';
import { difference } from './array';

describe('difference', () => {
  test('number array', () => {
    expect(difference([], [], (a, b) => a === b)).toEqual([]);
    expect(difference([1, 2, 3], [1, 2], (a, b) => a === b)).toEqual([3]);
    expect(difference([1, 2], [1, 2, 3], (a, b) => a === b)).toEqual([]);
    expect(difference([1, 2], [], (a, b) => a === b)).toEqual([1, 2]);
    expect(difference([1, 2], [1, 1, 1], (a, b) => a === b)).toEqual([2]);
  });

  test('object array', () => {
    expect(
      difference([{ a: 1 }, { a: 2 }, { a: 3 }], [{ a: 1 }, { a: 2 }], (x, y) => x.a === y.a)
    ).toEqual([{ a: 3 }]);
  });
});
