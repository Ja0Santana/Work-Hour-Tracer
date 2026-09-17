import { useMemo } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useSettings } from '../../hooks/useSettings';
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
  const { settings } = useSettings();
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const dailyTotals = useMemo(() => getDailyTotals(entries, weekStart), [entries, weekStart]);
  const today = new Date();

  const dailyGoalReference = useMemo(() => {
    return Math.max(60, Math.round(settings.weeklyGoalMinutes / 5));
  }, [settings.weeklyGoalMinutes]);

  return (
    <div className="week-calendar">
      {days.map((day) => {
        const dateStr = toDateString(day);
        const isActive = dateStr === selectedDate;
        const isToday = isSameDay(day, today);
        const totalMinutes = dailyTotals.get(dateStr) ?? 0;
        const progressPercentage = Math.min(100, Math.round((totalMinutes / dailyGoalReference) * 100));

        return (
          <button
            key={dateStr}
            type="button"
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
            <div className="week-day-bar-track">
              <div
                className={`week-day-bar-fill ${totalMinutes >= dailyGoalReference ? 'goal-reached' : ''}`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
