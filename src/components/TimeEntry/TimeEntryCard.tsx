import type { TimeEntry } from '../../types/timeEntry';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../../types/timeEntry';
import { calculateDuration, formatDuration } from '../../utils/time';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => void;
}

export function TimeEntryCard({ entry, onEdit, onDelete }: TimeEntryCardProps) {
  const duration = calculateDuration(entry.startTime, entry.endTime);
  const categoryColor = CATEGORY_COLORS[entry.category];

  return (
    <div className="entry-card">
      <div className="entry-time-col">
        <span className="entry-time">{entry.startTime}</span>
        <span className="entry-time" style={{ color: 'var(--text-tertiary)' }}>
          {entry.endTime}
        </span>
        <span className="entry-duration">{formatDuration(duration)}</span>
      </div>

      <div className="entry-content">
        <div className="entry-description">{entry.description}</div>
        <div className="entry-meta">
          <span
            className="badge"
            style={{
              background: `${categoryColor}20`,
              color: categoryColor,
            }}
          >
            {CATEGORY_LABELS[entry.category]}
          </span>
          {entry.project && (
            <span className="entry-project">{entry.project}</span>
          )}
        </div>
        {entry.notes && (
          <div className="entry-notes">{entry.notes}</div>
        )}
      </div>

      <div className="entry-actions">
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onEdit(entry)}
          aria-label={`Editar ${entry.description}`}
          title="Editar"
        >
          ✏️
        </button>
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => onDelete(entry)}
          aria-label={`Excluir ${entry.description}`}
          title="Excluir"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
