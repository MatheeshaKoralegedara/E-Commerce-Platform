const { calculateDiscount } = require('../src/models/discountModel');

describe('calculateDiscount', () => {
  test('percentage discount: 10% off Rs. 5000 = Rs. 500', () => {
    const code = { type: 'percentage', value: 10 };
    expect(calculateDiscount(code, 500000)).toBe(50000);
  });

  test('percentage discount: 100% off equals full subtotal', () => {
    const code = { type: 'percentage', value: 100 };
    expect(calculateDiscount(code, 500000)).toBe(500000);
  });

  test('fixed discount: flat amount subtracted directly', () => {
    const code = { type: 'fixed', value: 20000 };
    expect(calculateDiscount(code, 500000)).toBe(20000);
  });

  test('fixed discount never exceeds the subtotal (no negative totals)', () => {
    const code = { type: 'fixed', value: 999999 };
    expect(calculateDiscount(code, 500000)).toBe(500000);
  });

  test('percentage discount always returns a whole integer (cents cannot be fractional)', () => {
    const code = { type: 'percentage', value: 33 };
    const result = calculateDiscount(code, 10001);
    expect(Number.isInteger(result)).toBe(true);
  });
});
