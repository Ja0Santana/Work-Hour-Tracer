import { useState, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TimeEntry } from '../types/timeEntry';
import type { StoppedTimerResult } from '../hooks/useLiveTimer';
import { getWeekStart, getTodayString, formatDateShort } from '../utils/date';
import { WeeklyProgress } from '../components/Dashboard/WeeklyProgress';
import { WeekCalendar } from '../components/WeeklyGoal/WeekCalendar';
import { MonthlySummary } from '../components/MonthlySummary/MonthlySummary';
import { Timeline } from '../components/Timeline/Timeline';
import { TimeEntryList } from '../components/TimeEntry/TimeEntryList';
import { TimeEntryForm } from '../components/TimeEntry/TimeEntryForm';
import { LiveTracker } from '../components/Dashboard/LiveTracker';

export function Dashboard() {
  const today = new Date();
  const [weekStart, setWeekStart] = useState(() => getWeekStart(today));
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [initialFormValues, setInitialFormValues] = useState<Partial<TimeEntry> | null>(null);

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
    setInitialFormValues(null);
    setEditingEntry(entry);
    setIsFormOpen(true);
  }

  function handleDuplicateEntry(entry: TimeEntry) {
    setEditingEntry(null);
    setInitialFormValues({
      date: selectedDate,
      project: entry.project,
      category: entry.category,
      description: entry.description,
      notes: entry.notes,
    });
    setIsFormOpen(true);
  }

  function handleFinishLiveTimer(timerResult: StoppedTimerResult) {
    setEditingEntry(null);
    setInitialFormValues({
      date: getTodayString(),
      startTime: timerResult.startTime,
      endTime: timerResult.endTime,
      project: timerResult.project,
      description: timerResult.description,
    });
    setSelectedDate(getTodayString());
    setIsFormOpen(true);
  }

  function handleCloseForm() {
    setIsFormOpen(false);
    setEditingEntry(null);
    setInitialFormValues(null);
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
          onClick={() => {
            setInitialFormValues(null);
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
        >
          <Plus size={18} /> Adicionar atividade
        </button>
      </div>

      <LiveTracker onFinishTimer={handleFinishLiveTimer} />

      <div className="section">
        <div className="section-header">
          <span className="section-title">Progresso Semanal</span>
          <div className="week-nav">
            <button
              className="week-nav-btn"
              onClick={handlePrevWeek}
              aria-label="Semana anterior"
            >
              <ChevronLeft size={16} />
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
              <ChevronRight size={16} />
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
          onDuplicateEntry={handleDuplicateEntry}
          onAddNew={() => {
            setInitialFormValues(null);
            setEditingEntry(null);
            setIsFormOpen(true);
          }}
        />
      </div>

      <TimeEntryForm
        isOpen={isFormOpen}
        editingEntry={editingEntry}
        initialValues={initialFormValues}
        defaultDate={selectedDate}
        onClose={handleCloseForm}
      />
    </div>
  );
}
