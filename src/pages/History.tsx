import { useState, useMemo } from 'react';
import type { TimeEntry } from '../types/timeEntry';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { getEntriesForMonth, calculateTotalMinutes } from '../utils/calculations';
import { formatMonthYear, parseDateString, formatDateDisplay } from '../utils/date';
import { calculateDuration, formatDuration } from '../utils/time';
import { TimeEntryCard } from '../components/TimeEntry/TimeEntryCard';
import { TimeEntryForm } from '../components/TimeEntry/TimeEntryForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useSettings } from '../hooks/useSettings';
import { calculateEntriesEarnings } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { downloadMonthlySummaryImage } from '../utils/imageGenerator';
import { exportMonthToExcel } from '../utils/excelExporter';

export function History() {
  const { entries, deleteEntry } = useTimeEntries();
  const { settings } = useSettings();
  const today = new Date();

  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

  const monthEntries = useMemo(
    () => getEntriesForMonth(entries, monthYear.year, monthYear.month),
    [entries, monthYear],
  );

  const monthlyMinutes = useMemo(() => calculateTotalMinutes(monthEntries), [monthEntries]);
  const monthlyEarnings = calculateEntriesEarnings(monthEntries);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, TimeEntry[]>();
    for (const entry of monthEntries) {
      const existing = groups.get(entry.date) ?? [];
      existing.push(entry);
      groups.set(entry.date, existing);
    }

    const sorted = Array.from(groups.entries()).sort(([a], [b]) => b.localeCompare(a));
    return sorted.map(([date, dayEntries]) => ({
      date,
      entries: dayEntries.sort((a, b) => b.startTime.localeCompare(a.startTime)),
      totalMinutes: calculateTotalMinutes(dayEntries),
    }));
  }, [monthEntries]);

  const displayDate = new Date(monthYear.year, monthYear.month);

  function handlePrevMonth() {
    setMonthYear((prev) => {
      const d = new Date(prev.year, prev.month - 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function handleNextMonth() {
    setMonthYear((prev) => {
      const d = new Date(prev.year, prev.month + 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function handleConfirmDelete() {
    if (entryToDelete) {
      deleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  }

  const monthName = displayDate.toLocaleDateString('pt-BR', { month: 'long' });

  function handleExportImage() {
    downloadMonthlySummaryImage({
      monthName,
      year: monthYear.year,
      totalWorkedFormatted: formatDuration(monthlyMinutes),
      hourlyRateFormatted: formatCurrency(settings.hourlyRate),
      totalEarningsFormatted: formatCurrency(monthlyEarnings),
      totalEntriesCount: monthEntries.length,
      workedDaysCount: groupedByDay.length,
      weeklyGoalFormatted: formatDuration(settings.weeklyGoalMinutes),
    });
  }

  function handleExportExcel() {
    exportMonthToExcel({
      entries: monthEntries,
      year: monthYear.year,
      month: monthYear.month,
      monthName,
    });
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Histórico</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="month-nav">
            <button className="week-nav-btn" onClick={handlePrevMonth} aria-label="Mês anterior">
              ‹
            </button>
            <span className="month-nav-label">{formatMonthYear(displayDate)}</span>
            <button className="week-nav-btn" onClick={handleNextMonth} aria-label="Próximo mês">
              ›
            </button>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleExportImage}
            style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
            title="Baixar imagem com resumo mensal"
          >
            📷 Exportar Imagem
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportExcel}
            style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
            title="Baixar planilha Excel com dados do mês"
            disabled={monthEntries.length === 0}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <span className="card-title">Total no mês</span>
          <div className="card-value accent">{formatDuration(monthlyMinutes)}</div>
        </div>
        <div className="card">
          <span className="card-title">Atividades</span>
          <div className="card-value">{monthEntries.length}</div>
        </div>
        <div className="card">
          <span className="card-title">Estimativa</span>
          <div className="card-value accent">{formatCurrency(monthlyEarnings)}</div>
        </div>
      </div>

      {groupedByDay.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-title">Nenhum registro neste mês</div>
          <div className="empty-state-description">
            Não há horas de trabalho registradas para este mês ainda.
          </div>
        </div>
      ) : (
        groupedByDay.map(({ date, entries: dayEntries, totalMinutes }) => (
          <div key={date} className="history-day-group">
            <div className="history-day-header">
              <span className="history-day-date">
                {formatDateDisplay(parseDateString(date))}
              </span>
              <span className="history-day-total">{formatDuration(totalMinutes)}</span>
            </div>
            <div className="history-entries">
              {dayEntries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={setEditingEntry}
                  onDelete={setEntryToDelete}
                />
              ))}
            </div>
          </div>
        ))
      )}

      <TimeEntryForm
        isOpen={editingEntry !== null}
        editingEntry={editingEntry}
        onClose={() => setEditingEntry(null)}
      />

      <ConfirmDialog
        isOpen={entryToDelete !== null}
        title="Excluir atividade?"
        message={
          entryToDelete ? (
            <>
              Isso removerá <strong>{formatDuration(calculateDuration(entryToDelete.startTime, entryToDelete.endTime))}</strong> dos
              seus registros de trabalho.
            </>
          ) : ''
        }
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
