import { describe, it, expect } from 'vitest';
import { calculateDuration, formatDuration, isValidTimeString, timeStringToMinutes } from '../time';

describe('calculateDuration', () => {
  it('calcula duração simples', () => {
    expect(calculateDuration('13:00', '17:00')).toBe(240);
  });

  it('calcula fração de hora', () => {
    expect(calculateDuration('13:00', '13:30')).toBe(30);
  });

  it('calcula atividade cruzando meia-noite', () => {
    expect(calculateDuration('22:00', '02:00')).toBe(240);
  });

  it('calcula 1 hora', () => {
    expect(calculateDuration('08:00', '09:00')).toBe(60);
  });

  it('calcula dia inteiro', () => {
    expect(calculateDuration('00:00', '23:59')).toBe(1439);
  });

  it('calcula horário igual como 24h', () => {
    expect(calculateDuration('09:00', '09:00')).toBe(1440);
  });
});

describe('formatDuration', () => {
  it('formata 240 minutos', () => {
    expect(formatDuration(240)).toBe('4h 00min');
  });

  it('formata 30 minutos', () => {
    expect(formatDuration(30)).toBe('0h 30min');
  });

  it('formata 0 minutos', () => {
    expect(formatDuration(0)).toBe('0h 00min');
  });

  it('formata 750 minutos', () => {
    expect(formatDuration(750)).toBe('12h 30min');
  });

  it('formata valor negativo como 0', () => {
    expect(formatDuration(-10)).toBe('0h 00min');
  });
});

describe('timeStringToMinutes', () => {
  it('converte 13:00 para 780', () => {
    expect(timeStringToMinutes('13:00')).toBe(780);
  });

  it('converte 00:00 para 0', () => {
    expect(timeStringToMinutes('00:00')).toBe(0);
  });

  it('converte 23:59 para 1439', () => {
    expect(timeStringToMinutes('23:59')).toBe(1439);
  });
});

describe('isValidTimeString', () => {
  it('aceita horários válidos', () => {
    expect(isValidTimeString('00:00')).toBe(true);
    expect(isValidTimeString('13:30')).toBe(true);
    expect(isValidTimeString('23:59')).toBe(true);
  });

  it('rejeita horários inválidos', () => {
    expect(isValidTimeString('25:00')).toBe(false);
    expect(isValidTimeString('12:60')).toBe(false);
    expect(isValidTimeString('abc')).toBe(false);
    expect(isValidTimeString('')).toBe(false);
    expect(isValidTimeString('9:00')).toBe(false);
  });
});
