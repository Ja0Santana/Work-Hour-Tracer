import { useState, useEffect, useCallback, useMemo } from 'react';

const TIMER_STORAGE_KEY = 'work-hours.active-timer';

export type TimerStatus = 'idle' | 'running' | 'paused';

interface PersistedTimerData {
  status: TimerStatus;
  startTimestamp: number | null;
  accumulatedSeconds: number;
  startTimeString: string | null;
  project: string;
  description: string;
}

const INITIAL_TIMER_STATE: PersistedTimerData = {
  status: 'idle',
  startTimestamp: null,
  accumulatedSeconds: 0,
  startTimeString: null,
  project: '',
  description: '',
};

function formatCurrentTimeString(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function loadPersistedTimer(): PersistedTimerData {
  try {
    const rawData = localStorage.getItem(TIMER_STORAGE_KEY);
    if (!rawData) {
      return INITIAL_TIMER_STATE;
    }
    const parsedData = JSON.parse(rawData) as PersistedTimerData;
    return parsedData;
  } catch {
    return INITIAL_TIMER_STATE;
  }
}

function savePersistedTimer(data: PersistedTimerData): void {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Falha silenciosa de localStorage
  }
}

export interface StoppedTimerResult {
  startTime: string;
  endTime: string;
  project: string;
  description: string;
  durationMinutes: number;
}

export function useLiveTimer() {
  const [timerData, setTimerData] = useState<PersistedTimerData>(() => loadPersistedTimer());
  const [currentSeconds, setCurrentSeconds] = useState<number>(() => {
    const initial = loadPersistedTimer();
    if (initial.status === 'running' && initial.startTimestamp) {
      const elapsedSinceStart = Math.floor((Date.now() - initial.startTimestamp) / 1000);
      return initial.accumulatedSeconds + Math.max(0, elapsedSinceStart);
    }
    return initial.accumulatedSeconds;
  });

  useEffect(() => {
    savePersistedTimer(timerData);
  }, [timerData]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (timerData.status === 'running' && timerData.startTimestamp) {
      intervalId = setInterval(() => {
        const elapsedSinceStart = Math.floor((Date.now() - (timerData.startTimestamp ?? Date.now())) / 1000);
        setCurrentSeconds(timerData.accumulatedSeconds + Math.max(0, elapsedSinceStart));
      }, 1000);
    } else {
      setCurrentSeconds(timerData.accumulatedSeconds);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerData.status, timerData.startTimestamp, timerData.accumulatedSeconds]);

  const startTimer = useCallback(() => {
    const currentTimeString = formatCurrentTimeString();
    const updatedData: PersistedTimerData = {
      ...timerData,
      status: 'running',
      startTimestamp: Date.now(),
      accumulatedSeconds: 0,
      startTimeString: currentTimeString,
    };
    setTimerData(updatedData);
    setCurrentSeconds(0);
  }, [timerData]);

  const pauseTimer = useCallback(() => {
    if (timerData.status !== 'running' || !timerData.startTimestamp) return;

    const elapsedSinceStart = Math.floor((Date.now() - timerData.startTimestamp) / 1000);
    const totalAccumulated = timerData.accumulatedSeconds + Math.max(0, elapsedSinceStart);

    const updatedData: PersistedTimerData = {
      ...timerData,
      status: 'paused',
      startTimestamp: null,
      accumulatedSeconds: totalAccumulated,
    };
    setTimerData(updatedData);
    setCurrentSeconds(totalAccumulated);
  }, [timerData]);

  const resumeTimer = useCallback(() => {
    if (timerData.status !== 'paused') return;

    const updatedData: PersistedTimerData = {
      ...timerData,
      status: 'running',
      startTimestamp: Date.now(),
    };
    setTimerData(updatedData);
  }, [timerData]);

  const resetTimer = useCallback(() => {
    setTimerData(INITIAL_TIMER_STATE);
    setCurrentSeconds(0);
    try {
      localStorage.removeItem(TIMER_STORAGE_KEY);
    } catch {
      // Ignorar erro
    }
  }, []);

  const stopTimer = useCallback((): StoppedTimerResult | null => {
    if (timerData.status === 'idle') {
      return null;
    }

    let finalTotalSeconds = timerData.accumulatedSeconds;
    if (timerData.status === 'running' && timerData.startTimestamp) {
      const elapsedSinceStart = Math.floor((Date.now() - timerData.startTimestamp) / 1000);
      finalTotalSeconds += Math.max(0, elapsedSinceStart);
    }

    const calculatedMinutes = Math.max(1, Math.round(finalTotalSeconds / 60));
    const capturedStartTime = timerData.startTimeString || formatCurrentTimeString();
    const capturedEndTime = formatCurrentTimeString();

    const result: StoppedTimerResult = {
      startTime: capturedStartTime,
      endTime: capturedEndTime,
      project: timerData.project,
      description: timerData.description,
      durationMinutes: calculatedMinutes,
    };

    resetTimer();
    return result;
  }, [timerData, resetTimer]);

  const setProject = useCallback((project: string) => {
    setTimerData((prev) => ({ ...prev, project }));
  }, []);

  const setDescription = useCallback((description: string) => {
    setTimerData((prev) => ({ ...prev, description }));
  }, []);

  const formattedDuration = useMemo(() => {
    const hours = Math.floor(currentSeconds / 3600);
    const minutes = Math.floor((currentSeconds % 3600) / 60);
    const seconds = currentSeconds % 60;

    const pad = (valueNumber: number) => String(valueNumber).padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  }, [currentSeconds]);

  return {
    status: timerData.status,
    currentSeconds,
    formattedDuration,
    project: timerData.project,
    description: timerData.description,
    startTimeString: timerData.startTimeString,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    setProject,
    setDescription,
  };
}
