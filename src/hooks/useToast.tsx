import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

export type ToastType = 'info' | 'success' | 'error';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  durationMs: number;
}

export interface ShowToastOptions {
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

interface ToastContextValue {
  activeToasts: ToastItem[];
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (toastId: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((toastId: string) => {
    setActiveToasts((currentToasts) => currentToasts.filter((item) => item.id !== toastId));
  }, []);

  const showToast = useCallback((options: ShowToastOptions): string => {
    const generatedId = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const toastDurationMs = options.durationMs ?? (options.onAction ? 6000 : 3500);

    const newToast: ToastItem = {
      id: generatedId,
      message: options.message,
      type: options.type ?? 'info',
      actionLabel: options.actionLabel,
      onAction: options.onAction,
      durationMs: toastDurationMs,
    };

    setActiveToasts((currentToasts) => [...currentToasts, newToast]);

    setTimeout(() => {
      dismissToast(generatedId);
    }, toastDurationMs);

    return generatedId;
  }, [dismissToast]);

  const contextValue = useMemo(() => ({
    activeToasts,
    showToast,
    dismissToast,
  }), [activeToasts, showToast, dismissToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
}
