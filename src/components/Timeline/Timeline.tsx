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
const LANE_HEIGHT_PX = 36;
const LANE_GAP_PX = 4;

interface EntryWithLane {
  entry: TimeEntry;
  lane: number;
  startMinutes: number;
  endMinutes: number;
}

function assignLanes(entries: TimeEntry[]): EntryWithLane[] {
  const mapped = entries.map((entry) => {
    const startMinutes = timeStringToMinutes(entry.startTime);
    let endMinutes = timeStringToMinutes(entry.endTime);
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    return { entry, startMinutes, endMinutes, lane: 0 };
  });

  mapped.sort((a, b) => a.startMinutes - b.startMinutes || a.endMinutes - b.endMinutes);

  const laneEnds: number[] = [];

  for (const item of mapped) {
    let assignedLane = -1;

    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] <= item.startMinutes) {
        assignedLane = i;
        break;
      }
    }

    if (assignedLane === -1) {
      assignedLane = laneEnds.length;
      laneEnds.push(0);
    }

    item.lane = assignedLane;
    laneEnds[assignedLane] = item.endMinutes;
  }

  return mapped;
}

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

  const entriesWithLanes = useMemo(() => assignLanes(dayEntries), [dayEntries]);
  const laneCount = useMemo(
    () => (entriesWithLanes.length > 0 ? Math.max(...entriesWithLanes.map((e) => e.lane)) + 1 : 1),
    [entriesWithLanes],
  );

  const blocksHeight = laneCount * LANE_HEIGHT_PX + (laneCount - 1) * LANE_GAP_PX;
  const totalTimelineHeight = 20 + 8 + blocksHeight + 8;

  function getBlockStyle(item: EntryWithLane): React.CSSProperties {
    const totalMinutes = TOTAL_HOURS * 60;
    const startPercent = ((item.startMinutes - TIMELINE_START_HOUR * 60) / totalMinutes) * 100;
    const widthPercent = ((item.endMinutes - item.startMinutes) / totalMinutes) * 100;
    const topPx = item.lane * (LANE_HEIGHT_PX + LANE_GAP_PX);

    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.min(widthPercent, 100 - Math.max(0, startPercent))}%`,
      top: `${topPx}px`,
      height: `${LANE_HEIGHT_PX}px`,
      background: CATEGORY_COLORS[item.entry.category],
    };
  }

  if (dayEntries.length === 0) {
    return (
      <div className="card">
        <span className="card-title">Timeline</span>
        <div className="timeline-container" style={{ marginTop: 'var(--space-3)' }}>
          <div className="timeline" style={{ height: `${totalTimelineHeight}px` }}>
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
        <div className="timeline" style={{ height: `${totalTimelineHeight}px` }}>
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
          <div className="timeline-blocks" style={{ height: `${blocksHeight}px` }}>
            {entriesWithLanes.map((item) => (
              <div
                key={item.entry.id}
                className="timeline-block"
                style={getBlockStyle(item)}
                onClick={() => onSelectEntry(item.entry)}
                title={`${item.entry.startTime} – ${item.entry.endTime}: ${item.entry.description} (${CATEGORY_LABELS[item.entry.category]})`}
                role="button"
                tabIndex={0}
                aria-label={`${item.entry.description} de ${item.entry.startTime} até ${item.entry.endTime}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEntry(item.entry);
                  }
                }}
              >
                {item.entry.description}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
