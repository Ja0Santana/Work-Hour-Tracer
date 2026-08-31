import { useMemo } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { getDailyTotals } from '../../utils/calculations';
import { getWeekDays, formatWeekdayShort, toDateString, isSameDay } from '../../utils/date';
import { formatDuration } from '../../utils/time';

interface WeekCalendarProps {
  weekStart: Date;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export function WeekCalendar({ weekStart, selectedDate, onSelectDate }: WeekCalendarProps) {
  const { entries } = useTimeEntries();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const dailyTotals = useMemo(() => getDailyTotals(entries, weekStart), [entries, weekStart]);
  const today = new Date();

  return (
    <div className="week-calendar">
      {days.map((day) => {
        const dateStr = toDateString(day);
        const isActive = dateStr === selectedDate;
        const isToday = isSameDay(day, today);
        const totalMinutes = dailyTotals.get(dateStr) ?? 0;

        return (
          <button
            key={dateStr}
            className={`week-day ${isActive ? 'active' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => onSelectDate(dateStr)}
            aria-label={`${formatWeekdayShort(day)} ${day.getDate()} - ${formatDuration(totalMinutes)}`}
            aria-pressed={isActive}
          >
            <span className="week-day-name">{formatWeekdayShort(day)}</span>
            <span className="week-day-number">{day.getDate()}</span>
            <span className="week-day-hours">
              {totalMinutes > 0 ? formatDuration(totalMinutes) : '—'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
