import { describe, it, expect } from 'vitest';
import { generateCsvContent } from '../csvExporter';
import type { TimeEntry } from '../../types/timeEntry';

describe('generateCsvContent', () => {
  const mockEntries: TimeEntry[] = [
    {
      id: 'entry-1',
      date: '2026-03-10',
      project: 'Projeto Alpha',
      category: 'development',
      startTime: '09:00',
      endTime: '12:00',
      description: 'Implementação de "features"',
      notes: 'Nota com detalhe',
      hourlyRateAtCreation: 50,
      createdAt: '2026-03-10T09:00:00.000Z',
    },
  ];

  it('retorna string vazia quando a lista de entradas é vazia', () => {
    const result = generateCsvContent({ entries: [] });
    expect(result).toBe('');
  });

  it('gera cabeçalhos e linhas formatadas com separador ponto-e-vírgula e escape de aspas', () => {
    const result = generateCsvContent({ entries: mockEntries });
    expect(result.startsWith('\uFEFF')).toBe(true);
    expect(result).toContain('"Data";"Dia da Semana";"Início";"Fim"');
    expect(result).toContain('"2026-03-10"');
    expect(result).toContain('"09:00"');
    expect(result).toContain('"12:00"');
    expect(result).toContain('"180"');
    expect(result).toContain('"03:00"');
    expect(result).toContain('"Desenvolvimento"');
    expect(result).toContain('"Projeto Alpha"');
    expect(result).toContain('"Implementação de ""features"""');
    expect(result).toContain('"50,00"');
    expect(result).toContain('"150,00"');
  });
});
