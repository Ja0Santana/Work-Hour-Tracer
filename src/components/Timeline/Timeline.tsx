import { useMemo } from 'react';
import type { TimeEntry } from '../../types/timeEntry';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types/timeEntry';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { getEntriesForDay } from '../../utils/calculations';
import { timeStringToMinutes } from '../../utils/time';

interface TimelineProps {
  selectedDate: string;
  onSelectEntry: (entry: TimeEntry) => void;
}

const TIMELINE_START_HOUR = 0;
const TIMELINE_END_HOUR = 24;
const TOTAL_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

export function Timeline({ selectedDate, onSelectEntry }: TimelineProps) {
  const { entries } = useTimeEntries();

  const dayEntries = useMemo(
    () => getEntriesForDay(entries, selectedDate),
    [entries, selectedDate],
  );

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = TIMELINE_START_HOUR; i < TIMELINE_END_HOUR; i++) {
      h.push(i);
    }
    return h;
  }, []);

  function getBlockStyle(entry: TimeEntry): React.CSSProperties {
    const startMinutes = timeStringToMinutes(entry.startTime);
    let endMinutes = timeStringToMinutes(entry.endTime);

    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }

    const totalMinutes = TOTAL_HOURS * 60;
    const startPercent = ((startMinutes - TIMELINE_START_HOUR * 60) / totalMinutes) * 100;
    const widthPercent = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.min(widthPercent, 100 - startPercent)}%`,
      background: CATEGORY_COLORS[entry.category],
    };
  }

  if (dayEntries.length === 0) {
    return (
      <div className="card">
        <span className="card-title">Timeline</span>
        <div className="timeline-container" style={{ marginTop: 'var(--space-3)' }}>
          <div className="timeline">
            <div className="timeline-hours">
              {hours.map((h) => (
                <span key={h} className="timeline-hour-label">
                  {String(h).padStart(2, '0')}
                </span>
              ))}
            </div>
            <div className="timeline-grid">
              {hours.map((h) => (
                <div key={h} className="timeline-grid-line" />
              ))}
            </div>
          </div>
        </div>
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2) 0',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          Nenhuma atividade neste dia
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <span className="card-title">Timeline</span>
      <div className="timeline-container" style={{ marginTop: 'var(--space-3)' }}>
        <div className="timeline">
          <div className="timeline-hours">
            {hours.map((h) => (
              <span key={h} className="timeline-hour-label">
                {String(h).padStart(2, '0')}
              </span>
            ))}
          </div>
          <div className="timeline-grid">
            {hours.map((h) => (
              <div key={h} className="timeline-grid-line" />
            ))}
          </div>
          <div className="timeline-blocks">
            {dayEntries.map((entry) => (
              <div
                key={entry.id}
                className="timeline-block"
                style={getBlockStyle(entry)}
                onClick={() => onSelectEntry(entry)}
                title={`${entry.startTime} – ${entry.endTime}: ${entry.description} (${CATEGORY_LABELS[entry.category]})`}
                role="button"
                tabIndex={0}
                aria-label={`${entry.description} de ${entry.startTime} até ${entry.endTime}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEntry(entry);
                  }
                }}
              >
                {entry.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
