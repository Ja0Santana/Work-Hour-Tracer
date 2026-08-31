import { useState, useMemo, useCallback } from 'react';
import type { TimeEntry } from '../types/timeEntry';
import { getWeekStart, getTodayString, formatDateShort } from '../utils/date';
import { WeeklyProgress } from '../components/Dashboard/WeeklyProgress';
import { WeekCalendar } from '../components/WeeklyGoal/WeekCalendar';
import { MonthlySummary } from '../components/MonthlySummary/MonthlySummary';
import { Timeline } from '../components/Timeline/Timeline';
import { TimeEntryList } from '../components/TimeEntry/TimeEntryList';
import { TimeEntryForm } from '../components/TimeEntry/TimeEntryForm';

export function Dashboard() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);

  const [monthYear, setMonthYear] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    return `${formatDateShort(weekStart)} — ${formatDateShort(end)}`;
  }, [weekStart]);

  const handlePrevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const newStart = new Date(prev);
      newStart.setDate(newStart.getDate() - 7);
      return newStart;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const newStart = new Date(prev);
      newStart.setDate(newStart.getDate() + 7);
      return newStart;
    });
  }, []);

  const handleCurrentWeek = useCallback(() => {
    setWeekStart(getWeekStart(new Date()));
    setSelectedDate(getTodayString());
  }, []);

  function handleEditEntry(entry: TimeEntry) {
    setEditingEntry(entry);
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingEntry(null);
  }

  function handleTimelineSelect(entry: TimeEntry) {
    handleEditEntry(entry);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setIsFormOpen(true)}
        >
          + Adicionar atividade
        </button>
      </div>

      <div className="section">
        <div className="section-header">
          <span className="section-title">Progresso Semanal</span>
          <div className="week-nav">
            <button
              className="week-nav-btn"
              onClick={handlePrevWeek}
              aria-label="Semana anterior"
            >
              ‹
            </button>
            <button
              className="btn btn-ghost"
              onClick={handleCurrentWeek}
              style={{ fontSize: '0.75rem' }}
            >
              {weekLabel}
            </button>
            <button
              className="week-nav-btn"
              onClick={handleNextWeek}
              aria-label="Próxima semana"
            >
              ›
            </button>
          </div>
        </div>

        <WeeklyProgress weekStart={weekStart} />
      </div>

      <div className="section">
        <WeekCalendar
          weekStart={weekStart}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </div>

      <div className="section">
        <Timeline
          selectedDate={selectedDate}
          onSelectEntry={handleTimelineSelect}
        />
      </div>

      <div className="section">
        <MonthlySummary
          year={monthYear.year}
          month={monthYear.month}
          onPrevMonth={() =>
            setMonthYear((prev) => {
              const d = new Date(prev.year, prev.month - 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
          onNextMonth={() =>
            setMonthYear((prev) => {
              const d = new Date(prev.year, prev.month + 1);
              return { year: d.getFullYear(), month: d.getMonth() };
            })
          }
        />
      </div>

      <div className="section">
        <TimeEntryList
          selectedDate={selectedDate}
          onEditEntry={handleEditEntry}
        />
      </div>

      <TimeEntryForm
        isOpen={isFormOpen}
        editingEntry={editingEntry}
        onClose={handleCloseForm}
      />
    </div>
  );
}
