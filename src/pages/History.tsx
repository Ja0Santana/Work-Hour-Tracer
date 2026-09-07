import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Camera, FileSpreadsheet, Calendar, Search } from 'lucide-react';
import type { TimeEntry, ActivityCategory } from '../types/timeEntry';
import { ACTIVITY_CATEGORIES, CATEGORY_LABELS, CATEGORY_COLORS } from '../types/timeEntry';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { getEntriesForMonth, calculateTotalMinutes, calculateEntriesEarnings } from '../utils/calculations';
import { formatMonthYear, parseDateString, formatDateDisplay } from '../utils/date';
import { calculateDuration, formatDuration } from '../utils/time';
import { formatCurrency } from '../utils/currency';
import { downloadMonthlySummaryImage } from '../utils/imageGenerator';
import { exportMonthToExcel } from '../utils/excelExporter';
import { TimeEntryCard } from '../components/TimeEntry/TimeEntryCard';
import { TimeEntryForm } from '../components/TimeEntry/TimeEntryForm';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { useSettings } from '../hooks/useSettings';

export function History() {
  const { entries, deleteEntry } = useTimeEntries();
  const { settings } = useSettings();
  const today = new Date();

  const [monthYear, setMonthYear] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

  const monthEntries = useMemo(
    () => getEntriesForMonth(entries, monthYear.year, monthYear.month),
    [entries, monthYear],
  );

  const monthlyMinutes = useMemo(() => calculateTotalMinutes(monthEntries), [monthEntries]);
  const monthlyEarnings = calculateEntriesEarnings(monthEntries);

  const availableProjects = useMemo(() => {
    const projects = new Set(monthEntries.map((e) => e.project).filter(Boolean));
    return Array.from(projects).sort();
  }, [monthEntries]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedProject !== 'all';

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return monthEntries.filter((entry) => {
      const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
      const matchesProject = selectedProject === 'all' || entry.project === selectedProject;
      const matchesQuery =
        !query ||
        entry.description.toLowerCase().includes(query) ||
        (entry.project && entry.project.toLowerCase().includes(query)) ||
        (entry.notes && entry.notes.toLowerCase().includes(query));

      return matchesCategory && matchesProject && matchesQuery;
    });
  }, [monthEntries, selectedCategory, selectedProject, searchQuery]);

  const filteredMinutes = useMemo(() => calculateTotalMinutes(filteredEntries), [filteredEntries]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<ActivityCategory, number>();
    for (const entry of monthEntries) {
      const current = map.get(entry.category) ?? 0;
      map.set(entry.category, current + calculateDuration(entry.startTime, entry.endTime));
    }

    return Array.from(map.entries())
      .map(([category, minutes]) => ({
        category,
        minutes,
        percentage: monthlyMinutes > 0 ? (minutes / monthlyMinutes) * 100 : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [monthEntries, monthlyMinutes]);

  const groupedByDay = useMemo(() => {
    const groups = new Map<string, TimeEntry[]>();
    for (const entry of filteredEntries) {
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
  }, [filteredEntries]);

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

  function handleResetFilters() {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedProject('all');
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
              <ChevronLeft size={16} />
            </button>
            <span className="month-nav-label">{formatMonthYear(displayDate)}</span>
            <button className="week-nav-btn" onClick={handleNextMonth} aria-label="Próximo mês">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleExportImage}
            style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
            title="Baixar imagem com resumo mensal"
          >
            <Camera size={14} /> Exportar Imagem
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleExportExcel}
            style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
            title="Baixar planilha Excel com dados do mês"
            disabled={monthEntries.length === 0}
          >
            <FileSpreadsheet size={14} /> Exportar Excel
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

      {monthEntries.length > 0 && (
        <>
          {categoryBreakdown.length > 0 && (
            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
              <span className="card-title">Distribuição por Categoria</span>
              <div
                style={{
                  display: 'flex',
                  height: '10px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  margin: 'var(--space-3) 0 var(--space-4) 0',
                  background: 'var(--bg-tertiary)',
                }}
              >
                {categoryBreakdown.map((item) => (
                  <div
                    key={item.category}
                    style={{
                      width: `${item.percentage}%`,
                      background: CATEGORY_COLORS[item.category],
                      transition: 'width var(--transition-normal)',
                    }}
                    title={`${CATEGORY_LABELS[item.category]}: ${item.percentage.toFixed(1)}% (${formatDuration(item.minutes)})`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                {categoryBreakdown.map((item) => (
                  <div
                    key={item.category}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        background: CATEGORY_COLORS[item.category],
                        display: 'inline-block',
                      }}
                    />
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>
                      {CATEGORY_LABELS[item.category]}
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      {formatDuration(item.minutes)}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.6875rem' }}>
                      ({item.percentage.toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: '1 1 200px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar por descrição ou projeto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
                />
              </div>

              <div style={{ flex: '0 1 180px' }}>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
                >
                  <option value="all">Todas as categorias</option>
                  {ACTIVITY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {availableProjects.length > 0 && (
                <div style={{ flex: '0 1 180px' }}>
                  <select
                    className="form-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
                  >
                    <option value="all">Todos os projetos</option>
                    {availableProjects.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleResetFilters}
                  style={{ fontSize: '0.8125rem', padding: 'var(--space-2) var(--space-3)' }}
                >
                  Limpar filtros
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <div
                style={{
                  marginTop: 'var(--space-3)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  Mostrando <strong>{filteredEntries.length}</strong> de <strong>{monthEntries.length}</strong> atividades
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Total filtrado: {formatDuration(filteredMinutes)}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {monthEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Calendar size={40} strokeWidth={1.5} />
          </div>
          <div className="empty-state-title">Nenhum registro neste mês</div>
          <div className="empty-state-description">
            Não há horas de trabalho registradas para este mês ainda.
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <Search size={40} strokeWidth={1.5} />
          </div>
          <div className="empty-state-title">Nenhuma atividade encontrada</div>
          <div className="empty-state-description">
            Nenhum registro corresponde aos filtros de busca aplicados.
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResetFilters}
            style={{ marginTop: 'var(--space-3)' }}
          >
            Limpar filtros
          </button>
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
        defaultDate={editingEntry?.date}
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
