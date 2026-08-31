import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currency';

describe('formatCurrency', () => {
  it('formata valor inteiro', () => {
    const result = formatCurrency(1400);
    expect(result).toContain('1.400');
    expect(result).toContain('R$');
  });

  it('formata valor com centavos', () => {
    const result = formatCurrency(17.5);
    expect(result).toContain('17,50');
    expect(result).toContain('R$');
  });

  it('formata valor grande', () => {
    const result = formatCurrency(5337.5);
    expect(result).toContain('5.337,50');
    expect(result).toContain('R$');
  });

  it('formata zero', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0,00');
    expect(result).toContain('R$');
  });
});
