import { describe, it, expect } from 'vitest';
import {
  calculateTotalMinutes,
  calculateRemainingMinutes,
  calculateSurplusMinutes,
  calculateProgress,
  calculateEarnings,
  calculateWeeklyMinutes,
  calculateMonthlyMinutes,
  getEntriesForDay,
  detectOverlaps,
} from '../calculations';
import type { TimeEntry } from '../../types/timeEntry';

function makeEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: '1',
    date: '2026-08-31',
    project: 'Test',
    category: 'development',
    startTime: '09:00',
    endTime: '17:00',
    description: 'Test activity',
    hourlyRateAtCreation: 35,
    createdAt: '2026-08-31T00:00:00Z',
    ...overrides,
  };
}

describe('calculateTotalMinutes', () => {
  it('soma múltiplas atividades', () => {
    const entries = [
      makeEntry({ startTime: '08:00', endTime: '09:00' }),
      makeEntry({ id: '2', startTime: '09:00', endTime: '12:00' }),
      makeEntry({ id: '3', startTime: '13:00', endTime: '17:00' }),
    ];
    expect(calculateTotalMinutes(entries)).toBe(60 + 180 + 240);
  });

  it('retorna 0 para lista vazia', () => {
    expect(calculateTotalMinutes([])).toBe(0);
  });
});

describe('calculateRemainingMinutes', () => {
  it('calcula restante corretamente', () => {
    expect(calculateRemainingMinutes(1650, 2400)).toBe(750);
  });

  it('nunca retorna negativo', () => {
    expect(calculateRemainingMinutes(2610, 2400)).toBe(0);
  });

  it('retorna 0 quando exatamente na meta', () => {
    expect(calculateRemainingMinutes(2400, 2400)).toBe(0);
  });
});

describe('calculateSurplusMinutes', () => {
  it('calcula excedente', () => {
    expect(calculateSurplusMinutes(2610, 2400)).toBe(210);
  });

  it('retorna 0 quando abaixo da meta', () => {
    expect(calculateSurplusMinutes(1650, 2400)).toBe(0);
  });
});

describe('calculateProgress', () => {
  it('calcula porcentagem', () => {
    expect(calculateProgress(1650, 2400)).toBeCloseTo(68.75);
  });

  it('permite ultrapassar 100%', () => {
    expect(calculateProgress(2610, 2400)).toBeCloseTo(108.75);
  });

  it('retorna 0 para meta zero', () => {
    expect(calculateProgress(100, 0)).toBe(0);
  });
});

describe('calculateEarnings', () => {
  it('calcula ganhos corretamente', () => {
    expect(calculateEarnings(30, 35)).toBeCloseTo(17.5);
  });

  it('calcula 8h × R$35', () => {
    expect(calculateEarnings(480, 35)).toBeCloseTo(280);
  });

  it('calcula 20h30 × R$35', () => {
    expect(calculateEarnings(1230, 35)).toBeCloseTo(717.5);
  });

  it('calcula 40h × R$35', () => {
    expect(calculateEarnings(2400, 35)).toBeCloseTo(1400);
  });
});

describe('calculateWeeklyMinutes', () => {
  it('soma apenas atividades da semana', () => {
    const weekStart = new Date(2026, 7, 31);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);

    const entries = [
      makeEntry({ date: '2026-08-31', startTime: '09:00', endTime: '17:00' }),
      makeEntry({ id: '2', date: '2026-08-20', startTime: '09:00', endTime: '12:00' }),
    ];

    const result = calculateWeeklyMinutes(entries, weekStart);
    expect(result).toBe(480);
  });
});

describe('calculateMonthlyMinutes', () => {
  it('soma apenas atividades do mês', () => {
    const entries = [
      makeEntry({ date: '2026-08-15', startTime: '09:00', endTime: '17:00' }),
      makeEntry({ id: '2', date: '2026-08-20', startTime: '09:00', endTime: '12:00' }),
      makeEntry({ id: '3', date: '2026-07-15', startTime: '09:00', endTime: '17:00' }),
    ];

    expect(calculateMonthlyMinutes(entries, 2026, 7)).toBe(480 + 180);
  });
});

describe('getEntriesForDay', () => {
  it('filtra por data', () => {
    const entries = [
      makeEntry({ date: '2026-08-31' }),
      makeEntry({ id: '2', date: '2026-08-30' }),
    ];
    expect(getEntriesForDay(entries, '2026-08-31')).toHaveLength(1);
  });
});

describe('detectOverlaps', () => {
  it('detecta sobreposição', () => {
    const entries = [
      makeEntry({ startTime: '13:00', endTime: '15:00' }),
      makeEntry({ id: '2', startTime: '14:00', endTime: '16:00' }),
    ];
    const overlaps = detectOverlaps(entries);
    expect(overlaps).toHaveLength(1);
    expect(overlaps[0].overlapMinutes).toBe(60);
  });

  it('não detecta atividades sem sobreposição', () => {
    const entries = [
      makeEntry({ startTime: '09:00', endTime: '12:00' }),
      makeEntry({ id: '2', startTime: '13:00', endTime: '17:00' }),
    ];
    expect(detectOverlaps(entries)).toHaveLength(0);
  });

  it('não detecta sobreposição entre dias diferentes', () => {
    const entries = [
      makeEntry({ date: '2026-08-31', startTime: '13:00', endTime: '15:00' }),
      makeEntry({ id: '2', date: '2026-08-30', startTime: '14:00', endTime: '16:00' }),
    ];
    expect(detectOverlaps(entries)).toHaveLength(0);
  });
});
