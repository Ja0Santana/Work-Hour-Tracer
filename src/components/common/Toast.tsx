import { Info, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useToast, type ToastType } from '../../hooks/useToast';

function getToastIcon(type: ToastType) {
  switch (type) {
    case 'success':
      return <CheckCircle2 size={16} className="toast-icon-success" />;
    case 'error':
      return <AlertCircle size={16} className="toast-icon-error" />;
    case 'info':
    default:
      return <Info size={16} className="toast-icon-info" />;
  }
}

export function ToastContainer() {
  const { activeToasts, dismissToast } = useToast();

  if (activeToasts.length === 0) {
    return null;
  }

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notificações">
      {activeToasts.map((toastItem) => (
        <div key={toastItem.id} className={`toast-item toast-${toastItem.type}`}>
          <div className="toast-content">
            {getToastIcon(toastItem.type)}
            <span className="toast-message">{toastItem.message}</span>
          </div>
          <div className="toast-actions">
            {toastItem.actionLabel && toastItem.onAction && (
              <button
                type="button"
                className="toast-action-btn"
                onClick={() => {
                  toastItem.onAction?.();
                  dismissToast(toastItem.id);
                }}
              >
                {toastItem.actionLabel}
              </button>
            )}
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => dismissToast(toastItem.id)}
              aria-label="Fechar notificação"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
