import * as XLSX from 'xlsx';
import type { TimeEntry } from '../types/timeEntry';
import { CATEGORY_LABELS } from '../types/timeEntry';
import { calculateDuration } from './time';
import { formatDateDisplay, parseDateString } from './date';
import { calculateEntriesEarnings } from './calculations';
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

export function exportMonthToExcel({ entries, year, month, monthName }: ExportMonthParams): void {
  if (entries.length === 0) return;

  const dayGroups = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const existing = dayGroups.get(entry.date) ?? [];
    existing.push(entry);
    dayGroups.set(entry.date, existing);
  }

  const sortedDays = Array.from(dayGroups.entries()).sort(([a], [b]) => a.localeCompare(b));

  const rows: (string | number | null)[][] = [];

  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  rows.push([`${capitalizedMonth} — ${year}`]);
  rows.push([]);

  rows.push(['Data', 'Horário', 'Duração', 'Projeto', 'Categoria', 'Valor/Hora', 'Descrição', 'Observações']);

  let totalMonthMinutes = 0;

  for (const [dateStr, dayEntries] of sortedDays) {
    const sortedEntries = [...dayEntries].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const displayDate = formatDateDisplay(parseDateString(dateStr));
    const capitalizedDate = displayDate.charAt(0).toUpperCase() + displayDate.slice(1);

    let dayTotalMinutes = 0;

    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const duration = calculateDuration(entry.startTime, entry.endTime);
      dayTotalMinutes += duration;

      rows.push([
        i === 0 ? capitalizedDate : '',
        `${entry.startTime} – ${entry.endTime}`,
        formatDurationHHMM(duration),
        entry.project || '',
        CATEGORY_LABELS[entry.category],
        formatCurrency(entry.hourlyRateAtCreation),
        entry.description,
        entry.notes || '',
      ]);
    }

    totalMonthMinutes += dayTotalMinutes;

    rows.push([
      '',
      'Total do dia',
      formatDurationHHMM(dayTotalMinutes),
      '',
      '',
      '',
      '',
      '',
    ]);

    rows.push([]);
  }

  const totalEarnings = calculateEntriesEarnings(entries);

  rows.push([]);
  rows.push(['', 'Total do mês', formatDurationHHMM(totalMonthMinutes)]);
  rows.push(['', 'Estimativa', formatCurrency(totalEarnings)]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 38 },
    { wch: 18 },
    { wch: 10 },
    { wch: 20 },
    { wch: 18 },
    { wch: 14 },
    { wch: 40 },
    { wch: 40 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, capitalizedMonth);

  const fileName = `horas-trabalho-${String(month + 1).padStart(2, '0')}-${year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
