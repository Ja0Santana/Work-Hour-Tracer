import { Play, Pause, Square, RotateCcw } from 'lucide-react';
import { useLiveTimer, type StoppedTimerResult } from '../../hooks/useLiveTimer';

interface LiveTrackerProps {
  onFinishTimer: (result: StoppedTimerResult) => void;
}

export function LiveTracker({ onFinishTimer }: LiveTrackerProps) {
  const {
    status,
    formattedDuration,
    project,
    description,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setProject,
    setDescription,
  } = useLiveTimer();

  function handleFinish() {
    const finishResult = stopTimer();
    if (finishResult) {
      onFinishTimer(finishResult);
    }
  }

  const isTimerActive = status === 'running' || status === 'paused';

  return (
    <div className={`live-tracker-card ${isTimerActive ? 'active-timer' : ''}`}>
      <div className="live-tracker-info">
        <div className="live-tracker-timer-display">
          <span className="live-tracker-digits">{formattedDuration}</span>
          <span className={`live-tracker-badge ${status}`}>
            {status === 'running' ? 'Gravando' : status === 'paused' ? 'Pausado' : 'Cronômetro'}
          </span>
        </div>

        <div className="live-tracker-inputs">
          <input
            type="text"
            className="live-tracker-input"
            placeholder="Projeto (opcional)"
            value={project}
            onChange={(event) => setProject(event.target.value)}
          />
          <input
            type="text"
            className="live-tracker-input"
            placeholder="O que está fazendo agora?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            style={{ minWidth: '220px' }}
          />
        </div>
      </div>

      <div className="live-tracker-controls">
        {status === 'idle' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={startTimer}
            title="Iniciar contagem de tempo em tempo real"
          >
            <Play size={16} fill="currentColor" /> Iniciar
          </button>
        )}

        {status === 'running' && (
          <>
            <button
              type="button"
              className="btn btn-secondary btn-icon"
              onClick={pauseTimer}
              title="Pausar cronômetro"
              aria-label="Pausar cronômetro"
            >
              <Pause size={16} />
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinish}
              title="Finalizar e registrar atividade"
            >
              <Square size={14} fill="currentColor" /> Concluir
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={resetTimer}
              title="Descartar contagem"
              aria-label="Descartar contagem"
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}

        {status === 'paused' && (
          <>
            <button
              type="button"
              className="btn btn-primary btn-icon"
              onClick={resumeTimer}
              title="Retomar cronômetro"
              aria-label="Retomar cronômetro"
            >
              <Play size={16} fill="currentColor" />
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleFinish}
              title="Finalizar e registrar atividade"
            >
              <Square size={14} fill="currentColor" /> Concluir
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={resetTimer}
              title="Descartar contagem"
              aria-label="Descartar contagem"
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
