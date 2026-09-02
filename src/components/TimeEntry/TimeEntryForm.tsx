import { useState, useEffect, useMemo } from 'react';
import type { TimeEntry, ActivityCategory } from '../../types/timeEntry';
import { ACTIVITY_CATEGORIES, CATEGORY_LABELS } from '../../types/timeEntry';
import { calculateDuration, formatDuration, isValidTimeString } from '../../utils/time';
import { getTodayString, isValidDateString } from '../../utils/date';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useSettings } from '../../hooks/useSettings';
import { detectOverlaps } from '../../utils/calculations';

interface TimeEntryFormProps {
  isOpen: boolean;
  editingEntry?: TimeEntry | null;
  onClose: () => void;
}

interface FormState {
  date: string;
  project: string;
  category: ActivityCategory;
  startTime: string;
  endTime: string;
  description: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  date: getTodayString(),
  project: '',
  category: 'development',
  startTime: '',
  endTime: '',
  description: '',
  notes: '',
};

interface FormErrors {
  date?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
}

export function TimeEntryForm({ isOpen, editingEntry, onClose }: TimeEntryFormProps) {
  const { entries, addEntry, updateEntry } = useTimeEntries();
  const { settings } = useSettings();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setForm({
          date: editingEntry.date,
          project: editingEntry.project,
          category: editingEntry.category,
          startTime: editingEntry.startTime,
          endTime: editingEntry.endTime,
          description: editingEntry.description,
          notes: editingEntry.notes ?? '',
        });
      } else {
        setForm({ ...INITIAL_FORM, date: getTodayString() });
      }
      setErrors({});
    }
  }, [isOpen, editingEntry]);

  const duration = useMemo(() => {
    if (isValidTimeString(form.startTime) && isValidTimeString(form.endTime)) {
      return calculateDuration(form.startTime, form.endTime);
    }
    return null;
  }, [form.startTime, form.endTime]);

  const existingProjects = useMemo(() => {
    const projects = new Set(entries.map((e) => e.project).filter(Boolean));
    return Array.from(projects).sort();
  }, [entries]);

  const overlapWarning = useMemo(() => {
    if (!isValidTimeString(form.startTime) || !isValidTimeString(form.endTime) || !form.date) {
      return null;
    }

    const tempEntry: TimeEntry = {
      id: editingEntry?.id ?? 'temp',
      date: form.date,
      project: form.project,
      category: form.category,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description,
      hourlyRateAtCreation: editingEntry?.hourlyRateAtCreation ?? settings.hourlyRate,
      createdAt: new Date().toISOString(),
    };

    const otherEntries = entries.filter((e) => e.id !== tempEntry.id);
    const allEntries = [...otherEntries, tempEntry];
    const overlaps = detectOverlaps(allEntries);
    const relevant = overlaps.filter(
      (o) => o.entryA.id === tempEntry.id || o.entryB.id === tempEntry.id,
    );

    if (relevant.length > 0) {
      const totalOverlap = relevant.reduce((sum, o) => sum + o.overlapMinutes, 0);
      return `Sobreposição de ${formatDuration(totalOverlap)} com outra(s) atividade(s).`;
    }

    return null;
  }, [form, entries, editingEntry]);

  function validate(): boolean {
    const newErrors: FormErrors = {};

    if (!isValidDateString(form.date)) {
      newErrors.date = 'Data inválida';
    }
    if (!isValidTimeString(form.startTime)) {
      newErrors.startTime = 'Horário inválido';
    }
    if (!isValidTimeString(form.endTime)) {
      newErrors.endTime = 'Horário inválido';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Descrição obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const entryData = {
      date: form.date,
      project: form.project.trim(),
      category: form.category,
      startTime: form.startTime,
      endTime: form.endTime,
      description: form.description.trim(),
      notes: form.notes.trim() || undefined,
    };

    if (editingEntry) {
      updateEntry(editingEntry.id, entryData);
    } else {
      addEntry({ ...entryData, hourlyRateAtCreation: settings.hourlyRate });
    }

    onClose();
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={editingEntry ? 'Editar atividade' : 'Nova atividade'}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {editingEntry ? 'Editar Atividade' : 'Nova Atividade'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="entry-date">Data</label>
            <input
              id="entry-date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={(e) => handleChange('date', e.target.value)}
            />
            {errors.date && <span className="form-error">{errors.date}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="entry-project">Projeto</label>
            <input
              id="entry-project"
              type="text"
              className="form-input"
              value={form.project}
              onChange={(e) => handleChange('project', e.target.value)}
              placeholder="Nome do projeto"
              list="project-suggestions"
            />
            <datalist id="project-suggestions">
              {existingProjects.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="entry-category">Categoria</label>
            <select
              id="entry-category"
              className="form-select"
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {ACTIVITY_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="entry-start">Início</label>
              <input
                id="entry-start"
                type="time"
                className="form-input"
                value={form.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
              />
              {errors.startTime && <span className="form-error">{errors.startTime}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="entry-end">Fim</label>
              <input
                id="entry-end"
                type="time"
                className="form-input"
                value={form.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
              />
              {errors.endTime && <span className="form-error">{errors.endTime}</span>}
            </div>
          </div>

          {duration !== null && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--accent-glow)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--accent-primary)',
            }}>
              ⏱ Duração: {formatDuration(duration)}
            </div>
          )}

          {overlapWarning && (
            <div className="overlap-warning">
              ⚠ {overlapWarning}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="entry-description">Atividade</label>
            <input
              id="entry-description"
              type="text"
              className="form-input"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="O que você fez?"
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="entry-notes">Resultado / Observações</label>
            <textarea
              id="entry-notes"
              className="form-input form-textarea"
              value={form.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEntry ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
