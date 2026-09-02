import * as XLSX from 'xlsx';
import type { TimeEntry } from '../types/timeEntry';
import { CATEGORY_LABELS } from '../types/timeEntry';
import { calculateDuration } from './time';
import { parseDateString } from './date';
import { formatCurrency } from './currency';

interface ExportMonthParams {
  entries: TimeEntry[];
  year: number;
  month: number;
  monthName: string;
}

function formatDurationHHMM(totalMinutes: number): string {
  if (totalMinutes < 0) return '00:00';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatDayHeader(dateStr: string): string {
  const date = parseDateString(dateStr);
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  const day = date.getDate();
  const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  return `${capitalizedWeekday}, ${day}`;
}

function calculateEntryEarnings(entry: TimeEntry): number {
  const duration = calculateDuration(entry.startTime, entry.endTime);
  return (duration / 60) * entry.hourlyRateAtCreation;
}

export function exportMonthToExcel({ entries, year, month, monthName }: ExportMonthParams): void {
  if (entries.length === 0) return;

  const dayGroups = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const existing = dayGroups.get(entry.date) ?? [];
    existing.push(entry);
    dayGroups.set(entry.date, existing);
  }

  const sortedDays = Array.from(dayGroups.entries()).sort(([a], [b]) => a.localeCompare(b));
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);

  const HEADERS = ['Dia', 'Horário', 'Duração', 'Categoria', 'Valor/Hora', 'Descrição', 'Ganho'];

  const rows: (string | number | null)[][] = [];

  rows.push([`${capitalizedMonth} — ${year}`]);
  rows.push([]);
  rows.push(HEADERS);

  let totalMonthMinutes = 0;
  let totalMonthEarnings = 0;

  for (const [dateStr, dayEntries] of sortedDays) {
    const sortedEntries = [...dayEntries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const dayLabel = formatDayHeader(dateStr);

    let dayTotalMinutes = 0;
    let dayTotalEarnings = 0;

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const duration = calculateDuration(entry.startTime, entry.endTime);
      const earnings = calculateEntryEarnings(entry);
      dayTotalMinutes += duration;
      dayTotalEarnings += earnings;

      rows.push([
        i === 0 ? dayLabel : '',
        `${entry.startTime} – ${entry.endTime}`,
        formatDurationHHMM(duration),
        CATEGORY_LABELS[entry.category],
        formatCurrency(entry.hourlyRateAtCreation),
        entry.description,
        formatCurrency(earnings),
      ]);
    }

    totalMonthMinutes += dayTotalMinutes;
    totalMonthEarnings += dayTotalEarnings;

    rows.push([
      'Total do dia',
      '',
      formatDurationHHMM(dayTotalMinutes),
      '',
      '',
      '',
      formatCurrency(dayTotalEarnings),
    ]);

    rows.push([]);
  }

  rows.push([]);

  rows.push([
    'Total do mês',
    '',
    formatDurationHHMM(totalMonthMinutes),
    '',
    '',
    '',
    formatCurrency(totalMonthEarnings),
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 22 },
    { wch: 16 },
    { wch: 10 },
    { wch: 18 },
    { wch: 14 },
    { wch: 50 },
    { wch: 14 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, capitalizedMonth);

  const fileName = `horas-trabalho-${String(month + 1).padStart(2, '0')}-${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
