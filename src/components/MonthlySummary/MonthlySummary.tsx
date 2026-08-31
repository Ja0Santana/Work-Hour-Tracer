import { useMemo } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useSettings } from '../../hooks/useSettings';
import { calculateMonthlyMinutes, calculateEarnings } from '../../utils/calculations';
import { formatDuration } from '../../utils/time';
import { formatCurrency } from '../../utils/currency';
import { formatMonthYear } from '../../utils/date';

interface MonthlySummaryProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthlySummary({ year, month, onPrevMonth, onNextMonth }: MonthlySummaryProps) {
  const { entries } = useTimeEntries();
  const { settings } = useSettings();

  const monthlyMinutes = useMemo(
    () => calculateMonthlyMinutes(entries, year, month),
    [entries, year, month],
  );

  const monthlyEarnings = calculateEarnings(monthlyMinutes, settings.hourlyRate);
  const displayDate = new Date(year, month);

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Resumo Mensal</span>
        <div className="month-nav">
          <button
            className="week-nav-btn"
            onClick={onPrevMonth}
            aria-label="Mês anterior"
          >
            ‹
          </button>
          <span className="month-nav-label">{formatMonthYear(displayDate)}</span>
          <button
            className="week-nav-btn"
            onClick={onNextMonth}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <div>
          <div className="card-title" style={{ marginBottom: 'var(--space-1)' }}>Trabalhado</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatDuration(monthlyMinutes)}
          </div>
        </div>
        <div>
          <div className="card-title" style={{ marginBottom: 'var(--space-1)' }}>Valor/Hora</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {formatCurrency(settings.hourlyRate)}
          </div>
        </div>
        <div>
          <div className="card-title" style={{ marginBottom: 'var(--space-1)' }}>Estimativa</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {formatCurrency(monthlyEarnings)}
          </div>
        </div>
      </div>
    </div>
  );
}
