import type { TimeEntry } from '../types/timeEntry';
import { CATEGORY_LABELS } from '../types/timeEntry';
import { calculateDuration } from './time';
import { parseDateString } from './date';
import { calculateEarnings } from './calculations';

export interface ExportCsvParams {
  entries: TimeEntry[];
  year: number;
  month: number;
}

function escapeCsvField(field: string | number | undefined): string {
  if (field === undefined || field === null) {
    return '""';
  }
  const stringValue = String(field);
  const sanitized = stringValue.replace(/"/g, '""');
  return `"${sanitized}"`;
}

function formatDurationHHMM(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function generateCsvContent({ entries }: Pick<ExportCsvParams, 'entries'>): string {
  if (entries.length === 0) {
    return '';
  }

  const sortedEntries = [...entries].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.startTime.localeCompare(b.startTime);
  });

  const headers = [
    'Data',
    'Dia da Semana',
    'Início',
    'Fim',
    'Duração (minutos)',
    'Duração (hh:mm)',
    'Categoria',
    'Projeto',
    'Descrição',
    'Observações',
    'Valor por Hora (R$)',
    'Ganho Estimado (R$)',
  ];

  const rows: string[] = [];
  rows.push(headers.map(escapeCsvField).join(';'));

  for (const entry of sortedEntries) {
    const durationMinutes = calculateDuration(entry.startTime, entry.endTime);
    const parsedDate = parseDateString(entry.date);
    const dayOfWeek = parsedDate.toLocaleDateString('pt-BR', { weekday: 'long' });
    const earnings = calculateEarnings(durationMinutes, entry.hourlyRateAtCreation);

    const rowValues = [
      entry.date,
      dayOfWeek,
      entry.startTime,
      entry.endTime,
      durationMinutes,
      formatDurationHHMM(durationMinutes),
      CATEGORY_LABELS[entry.category],
      entry.project || '',
      entry.description,
      entry.notes || '',
      entry.hourlyRateAtCreation.toFixed(2).replace('.', ','),
      earnings.toFixed(2).replace('.', ','),
    ];

    rows.push(rowValues.map(escapeCsvField).join(';'));
  }

  return '\uFEFF' + rows.join('\r\n');
}

export function exportMonthToCsv({ entries, year, month }: ExportCsvParams): void {
  const csvContent = generateCsvContent({ entries });
  if (!csvContent) return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  const monthFormatted = String(month + 1).padStart(2, '0');
  downloadLink.href = url;
  downloadLink.download = `horas-trabalho-${monthFormatted}-${year}.csv`;
  downloadLink.click();
  URL.revokeObjectURL(url);
}
