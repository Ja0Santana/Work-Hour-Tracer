import { useMemo, useState } from 'react';
import type { TimeEntry } from '../../types/timeEntry';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { getEntriesForDay, calculateTotalMinutes } from '../../utils/calculations';
import { formatDuration } from '../../utils/time';
import { TimeEntryCard } from './TimeEntryCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { calculateDuration } from '../../utils/time';

interface TimeEntryListProps {
  selectedDate: string;
  onEditEntry: (entry: TimeEntry) => void;
}

export function TimeEntryList({ selectedDate, onEditEntry }: TimeEntryListProps) {
  const { entries, deleteEntry } = useTimeEntries();
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);

  const dayEntries = useMemo(() => {
    const filtered = getEntriesForDay(entries, selectedDate);
    return filtered.sort((a, b) => {
      if (a.startTime < b.startTime) return 1;
      if (a.startTime > b.startTime) return -1;
      return 0;
    });
  }, [entries, selectedDate]);

  const totalMinutes = useMemo(() => calculateTotalMinutes(dayEntries), [dayEntries]);

  function handleConfirmDelete() {
    if (entryToDelete) {
      deleteEntry(entryToDelete.id);
      setEntryToDelete(null);
    }
  }

  if (dayEntries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <div className="empty-state-title">Nenhuma atividade registrada</div>
        <div className="empty-state-description">
          Comece a rastrear seu trabalho adicionando sua primeira atividade do dia.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <span className="section-title">Atividades do dia</span>
        <span style={{
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--accent-primary)',
        }}>
          Total: {formatDuration(totalMinutes)}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {dayEntries.map((entry) => (
          <TimeEntryCard
            key={entry.id}
            entry={entry}
            onEdit={onEditEntry}
            onDelete={setEntryToDelete}
          />
        ))}
      </div>

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
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryToDelete(null)}
      />
    </div>
  );
}
