import { useMemo } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useSettings } from '../../hooks/useSettings';
import {
  calculateWeeklyMinutes,
  calculateRemainingMinutes,
  calculateSurplusMinutes,
  calculateProgress,
  calculateEarnings,
} from '../../utils/calculations';
import { formatDuration } from '../../utils/time';
import { formatCurrency } from '../../utils/currency';

interface WeeklyProgressProps {
  weekStart: Date;
}

export function WeeklyProgress({ weekStart }: WeeklyProgressProps) {
  const { entries } = useTimeEntries();
  const { settings } = useSettings();

  const workedMinutes = useMemo(
    () => calculateWeeklyMinutes(entries, weekStart),
    [entries, weekStart],
  );

  const remainingMinutes = calculateRemainingMinutes(workedMinutes, settings.weeklyGoalMinutes);
  const surplusMinutes = calculateSurplusMinutes(workedMinutes, settings.weeklyGoalMinutes);
  const progress = calculateProgress(workedMinutes, settings.weeklyGoalMinutes);
  const earnings = calculateEarnings(workedMinutes, settings.hourlyRate);
  const isGoalReached = workedMinutes >= settings.weeklyGoalMinutes;
  const progressCapped = Math.min(progress, 100);

  return (
    <div>
      <div className="stats-grid">
        <div className="card">
          <span className="card-title">Trabalhado</span>
          <div className="card-value accent">{formatDuration(workedMinutes)}</div>
        </div>

        <div className="card">
          <span className="card-title">Meta</span>
          <div className="card-value">{formatDuration(settings.weeklyGoalMinutes)}</div>
        </div>

        <div className="card">
          <span className="card-title">
            {isGoalReached ? 'Excedente' : 'Restante'}
          </span>
          <div className={`card-value ${isGoalReached ? 'success' : ''}`}>
            {isGoalReached
              ? `+${formatDuration(surplusMinutes)}`
              : formatDuration(remainingMinutes)}
          </div>
          {isGoalReached && (
            <span className="card-subtitle" style={{ color: 'var(--accent-success)' }}>
              ✓ Meta atingida
            </span>
          )}
        </div>

        <div className="card">
          <span className="card-title">Progresso</span>
          <div className="card-value">{progress.toFixed(1)}%</div>
          <div className="progress-bar-container" style={{ marginTop: 'var(--space-3)' }}>
            <div
              className={`progress-bar-fill ${isGoalReached ? 'success' : ''}`}
              style={{ width: `${progressCapped}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso semanal: ${progress.toFixed(1)}%`}
            />
          </div>
        </div>

        <div className="card">
          <span className="card-title">Valor/Hora</span>
          <div className="card-value">{formatCurrency(settings.hourlyRate)}</div>
        </div>

        <div className="card">
          <span className="card-title">Acumulado na semana</span>
          <div className="card-value accent">{formatCurrency(earnings)}</div>
        </div>
      </div>
    </div>
  );
}
