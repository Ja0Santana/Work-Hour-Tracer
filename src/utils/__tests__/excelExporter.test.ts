import { describe, it, expect } from 'vitest';
import { buildExcelReportRows } from '../excelExporter';
import type { TimeEntry } from '../../types/timeEntry';

describe('buildExcelReportRows', () => {
  const firstDayEntry: TimeEntry = {
    id: 'entry-1',
    date: '2026-03-10',
    project: 'Projeto Alpha',
    category: 'development',
    startTime: '09:00',
    endTime: '12:00',
    description: 'Atividade dia 1',
    notes: '',
    hourlyRateAtCreation: 50,
    createdAt: '2026-03-10T09:00:00.000Z',
  };

  const secondDayEntry: TimeEntry = {
    id: 'entry-2',
    date: '2026-03-11',
    project: 'Projeto Beta',
    category: 'meeting',
    startTime: '14:00',
    endTime: '15:30',
    description: 'Atividade dia 2',
    notes: '',
    hourlyRateAtCreation: 50,
    createdAt: '2026-03-11T14:00:00.000Z',
  };

  it('retorna array vazio quando nao ha entradas', () => {
    const rows = buildExcelReportRows({ entries: [], year: 2026, monthName: 'março' });
    expect(rows).toEqual([]);
  });

  it('adiciona linha divisoria entre dias diferentes e linha final antes do total do mes', () => {
    const rows = buildExcelReportRows({
      entries: [firstDayEntry, secondDayEntry],
      year: 2026,
      monthName: 'março',
    });

    const dividerRowIndices = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.length === 7 && row.every((cell) => typeof cell === 'string' && cell.startsWith('───')))
      .map(({ index }) => index);

    expect(dividerRowIndices).toHaveLength(2);

    const firstDividerIndex = dividerRowIndices[0];
    expect(rows[firstDividerIndex - 1][0]).toBe('Total do dia');
    const nextDayFirstCell = rows[firstDividerIndex + 1]?.[0];
    expect(typeof nextDayFirstCell === 'string' && nextDayFirstCell.length > 0).toBe(true);

    const finalDividerIndex = dividerRowIndices[1];
    expect(rows[finalDividerIndex - 1][0]).toBe('Total do dia');
    expect(rows[finalDividerIndex + 1][0]).toBe('Total do mês');
  });

  it('adiciona linha final separando do total do mes mesmo com apenas um unico dia', () => {
    const rows = buildExcelReportRows({
      entries: [firstDayEntry],
      year: 2026,
      monthName: 'março',
    });

    const dividerRowIndices = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => row.length === 7 && row.every((cell) => typeof cell === 'string' && cell.startsWith('───')))
      .map(({ index }) => index);

    expect(dividerRowIndices).toHaveLength(1);

    const finalDividerIndex = dividerRowIndices[0];
    expect(rows[finalDividerIndex - 1][0]).toBe('Total do dia');
    expect(rows[finalDividerIndex + 1][0]).toBe('Total do mês');
  });
});
