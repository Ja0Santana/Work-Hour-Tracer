import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder } from 'lucide-react';
import type { TimeEntry } from '../../types/timeEntry';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types/timeEntry';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { getEntriesForDay } from '../../utils/calculations';
import { calculateDuration, formatDuration, timeStringToMinutes } from '../../utils/time';
import { getTodayString } from '../../utils/date';

interface TimelineProps {
  selectedDate: string;
  onSelectEntry: (entry: TimeEntry) => void;
}

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
  const [isWorkHoursMode, setIsWorkHoursMode] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<{
    entry: TimeEntry;
    coordinateX: number;
    coordinateY: number;
    shouldPlaceBelow: boolean;
  } | null>(null);

  useEffect(() => {
    if (!hoveredItem) {
      return;
    }

    function handleDismissPopover() {
      setHoveredItem(null);
    }

    window.addEventListener('scroll', handleDismissPopover, { passive: true, capture: true });
    window.addEventListener('resize', handleDismissPopover, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleDismissPopover, { capture: true });
      window.removeEventListener('resize', handleDismissPopover);
    };
  }, [hoveredItem]);

  const dayEntries = useMemo(
    () => getEntriesForDay(entries, selectedDate),
    [entries, selectedDate],
  );

  const { startHour, endHour, totalHours } = useMemo(() => {
    if (!isWorkHoursMode) {
      return { startHour: 0, endHour: 24, totalHours: 24 };
    }

    let minHour = 7;
    let maxHour = 20;

    for (const entry of dayEntries) {
      const entryStart = Math.floor(timeStringToMinutes(entry.startTime) / 60);
      const entryEnd = Math.ceil(timeStringToMinutes(entry.endTime) / 60);
      if (entryStart < minHour) minHour = Math.max(0, entryStart);
      if (entryEnd > maxHour) maxHour = Math.min(24, entryEnd);
    }

    return {
      startHour: minHour,
      endHour: maxHour,
      totalHours: maxHour - minHour,
    };
  }, [isWorkHoursMode, dayEntries]);

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = startHour; i < endHour; i++) {
      h.push(i);
    }
    return h;
  }, [startHour, endHour]);

  const entriesWithLanes = useMemo(() => assignLanes(dayEntries), [dayEntries]);
  const laneCount = useMemo(
    () => (entriesWithLanes.length > 0 ? Math.max(...entriesWithLanes.map((e) => e.lane)) + 1 : 1),
    [entriesWithLanes],
  );

  const blocksHeight = laneCount * LANE_HEIGHT_PX + (laneCount - 1) * LANE_GAP_PX;
  const totalTimelineHeight = 20 + 8 + blocksHeight + 8;

  const isToday = selectedDate === getTodayString();
  const [currentMinuteTimestamp, setCurrentMinuteTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (!isToday) return;

    const intervalId = setInterval(() => {
      setCurrentMinuteTimestamp(Date.now());
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isToday]);

  const currentNowPercent = useMemo(() => {
    if (!isToday) return null;
    const now = new Date(currentMinuteTimestamp);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const timelineStartMinutes = startHour * 60;
    const timelineTotalMinutes = totalHours * 60;

    if (currentMinutes < timelineStartMinutes || currentMinutes > endHour * 60) {
      return null;
    }

    return ((currentMinutes - timelineStartMinutes) / timelineTotalMinutes) * 100;
  }, [isToday, currentMinuteTimestamp, startHour, endHour, totalHours]);

  function getBlockStyle(item: EntryWithLane): React.CSSProperties {
    const timelineStartMinutes = startHour * 60;
    const timelineTotalMinutes = totalHours * 60;
    const relativeStart = Math.max(0, item.startMinutes - timelineStartMinutes);
    const startPercent = (relativeStart / timelineTotalMinutes) * 100;
    const widthPercent = ((item.endMinutes - item.startMinutes) / timelineTotalMinutes) * 100;
    const topPx = item.lane * (LANE_HEIGHT_PX + LANE_GAP_PX);

    return {
      left: `${Math.max(0, startPercent)}%`,
      width: `${Math.min(widthPercent, 100 - Math.max(0, startPercent))}%`,
      top: `${topPx}px`,
      height: `${LANE_HEIGHT_PX}px`,
      background: CATEGORY_COLORS[item.entry.category],
    };
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <span className="card-title">Timeline</span>
        <div style={{ display: 'flex', gap: 'var(--space-1)', background: 'var(--bg-tertiary)', padding: '2px', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            className={`btn btn-sm ${isWorkHoursMode ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.6875rem', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}
            onClick={() => setIsWorkHoursMode(true)}
          >
            Foco ({String(startHour).padStart(2, '0')}h–{String(endHour).padStart(2, '0')}h)
          </button>
          <button
            type="button"
            className={`btn btn-sm ${!isWorkHoursMode ? 'btn-primary' : 'btn-ghost'}`}
            style={{ fontSize: '0.6875rem', padding: '2px 8px', height: 'auto', minHeight: 'unset' }}
            onClick={() => setIsWorkHoursMode(false)}
          >
            24h
          </button>
        </div>
      </div>

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

          {currentNowPercent !== null && (
            <div
              className="timeline-now-indicator"
              style={{ left: `${currentNowPercent}%` }}
              title="Horário atual"
            >
              <div className="timeline-now-dot" />
              <div className="timeline-now-line" />
            </div>
          )}

          {dayEntries.length > 0 && (
            <div className="timeline-blocks" style={{ height: `${blocksHeight}px` }}>
              {entriesWithLanes.map((item) => (
                <div
                  key={item.entry.id}
                  className="timeline-block"
                  style={getBlockStyle(item)}
                  onClick={() => onSelectEntry(item.entry)}
                  onMouseEnter={(event) => {
                    const boundingRectangle = event.currentTarget.getBoundingClientRect();
                    const estimatedPopoverWidth = 280;
                    const halfPopoverWidth = estimatedPopoverWidth / 2;
                    const rawCoordinateX = boundingRectangle.left + boundingRectangle.width / 2;
                    const clampedCoordinateX = Math.max(
                      halfPopoverWidth + 16,
                      Math.min(window.innerWidth - halfPopoverWidth - 16, rawCoordinateX)
                    );
                    const shouldPlaceBelow = boundingRectangle.top < 120;
                    const coordinateY = shouldPlaceBelow
                      ? boundingRectangle.bottom + 8
                      : boundingRectangle.top - 8;

                    setHoveredItem({
                      entry: item.entry,
                      coordinateX: clampedCoordinateX,
                      coordinateY,
                      shouldPlaceBelow,
                    });
                  }}
                  onMouseLeave={() => setHoveredItem(null)}
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
          )}
        </div>
      </div>

      {dayEntries.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-2) 0',
          fontSize: '0.75rem',
          color: 'var(--text-tertiary)',
        }}>
          Nenhuma atividade neste dia
        </div>
      )}

      {hoveredItem &&
        createPortal(
          <div
            className="timeline-popover"
            style={{
              left: `${hoveredItem.coordinateX}px`,
              top: `${hoveredItem.coordinateY}px`,
              transform: hoveredItem.shouldPlaceBelow
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -100%)',
            }}
          >
            <div className="timeline-popover-title">{hoveredItem.entry.description}</div>
            <div className="timeline-popover-meta">
              <span
                className="badge"
                style={{
                  background: `${CATEGORY_COLORS[hoveredItem.entry.category]}20`,
                  color: CATEGORY_COLORS[hoveredItem.entry.category],
                  fontSize: '0.6875rem',
                  padding: '2px 6px',
                }}
              >
                {CATEGORY_LABELS[hoveredItem.entry.category]}
              </span>
              <span>
                {hoveredItem.entry.startTime} – {hoveredItem.entry.endTime} (
                {formatDuration(calculateDuration(hoveredItem.entry.startTime, hoveredItem.entry.endTime))})
              </span>
            </div>
            {hoveredItem.entry.project && (
              <div style={{ color: 'var(--accent-primary)', fontSize: '0.6875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Folder size={12} /> {hoveredItem.entry.project}
              </div>
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
