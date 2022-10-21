class Calc {
  add(a: number, b: number): number {
    return a + b;
  }
}

const calc = new Calc();

describe('Calc', () => {
  test('should return 10 for add(6, 4)', () => {
    expect(calc.add(6, 4)).toBe(10);
  });

  test('should return 9 for add(10, -1)', () => {
    expect(calc.add(10, -1)).toBe(9);
  });
});
