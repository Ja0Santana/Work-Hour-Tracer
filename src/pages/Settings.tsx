import { useState, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { useTimeEntries } from '../hooks/useTimeEntries';
import { exportAllData, validateImportData, importAllData, clearAllData } from '../services/storage';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { formatCurrency } from '../utils/currency';

export function Settings() {
  const { settings, updateSettings } = useSettings();
  const { setAllEntries } = useTimeEntries();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [weeklyGoalHours, setWeeklyGoalHours] = useState(
    String(Math.floor(settings.weeklyGoalMinutes / 60)),
  );
  const [hourlyRate, setHourlyRate] = useState(String(settings.hourlyRate));
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<ReturnType<typeof exportAllData> | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleSaveGoal() {
    const hours = parseFloat(weeklyGoalHours);
    if (isNaN(hours) || hours < 0) {
      showToast('Meta semanal inválida. Use um número positivo.', 'error');
      return;
    }
    updateSettings({ weeklyGoalMinutes: Math.round(hours * 60) });
    showToast('Meta semanal atualizada.', 'success');
  }

  function handleSaveRate() {
    const rate = parseFloat(hourlyRate);
    if (isNaN(rate) || rate < 0) {
      showToast('Valor por hora inválido. Use um número positivo.', 'error');
      return;
    }
    updateSettings({ hourlyRate: rate });
    showToast('Valor por hora atualizado.', 'success');
  }

  function handleExport() {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-hours-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dados exportados com sucesso.', 'success');
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!validateImportData(data)) {
          showToast('Arquivo de backup inválido. Nenhum dado foi alterado.', 'error');
          return;
        }
        setPendingImportData(data);
        setShowImportConfirm(true);
      } catch {
        showToast('Erro ao ler o arquivo. Verifique se é um JSON válido.', 'error');
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleConfirmImport() {
    if (pendingImportData) {
      importAllData(pendingImportData);
      setAllEntries(pendingImportData.entries);
      updateSettings(pendingImportData.settings);
      setWeeklyGoalHours(String(Math.floor(pendingImportData.settings.weeklyGoalMinutes / 60)));
      setHourlyRate(String(pendingImportData.settings.hourlyRate));
      setPendingImportData(null);
      setShowImportConfirm(false);
      showToast('Dados importados com sucesso.', 'success');
    }
  }

  function handleClearAll() {
    clearAllData();
    setAllEntries([]);
    updateSettings({ weeklyGoalMinutes: 2400, hourlyRate: 35 });
    setWeeklyGoalHours('40');
    setHourlyRate('35');
    setShowClearConfirm(false);
    showToast('Todos os dados foram removidos.', 'success');
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Configurações</h1>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Meta Semanal</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="settings-goal">Horas por semana</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="settings-goal"
                type="number"
                className="form-input"
                value={weeklyGoalHours}
                onChange={(e) => setWeeklyGoalHours(e.target.value)}
                min="0"
                step="0.5"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSaveGoal}>
                Salvar
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Atual: {Math.floor(settings.weeklyGoalMinutes / 60)}h {settings.weeklyGoalMinutes % 60 > 0 ? `${settings.weeklyGoalMinutes % 60}min` : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Valor por Hora</h2>
        <div className="settings-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="settings-rate">Valor (R$)</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input
                id="settings-rate"
                type="number"
                className="form-input"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                min="0"
                step="0.50"
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={handleSaveRate}>
                Salvar
              </button>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
              Atual: {formatCurrency(settings.hourlyRate)}
            </span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Gerenciamento de Dados</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={handleExport}>
              📥 Exportar dados
            </button>
            <button className="btn btn-secondary" onClick={handleImportClick}>
              📤 Importar dados
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              aria-label="Selecionar arquivo de backup"
            />
          </div>
          <div>
            <button
              className="btn btn-danger"
              onClick={() => setShowClearConfirm(true)}
            >
              🗑️ Limpar todos os dados
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Limpar todos os dados?"
        message="Essa ação irá remover permanentemente todas as atividades e configurações. Essa ação não pode ser desfeita."
        confirmLabel="Limpar tudo"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />

      <ConfirmDialog
        isOpen={showImportConfirm}
        title="Importar dados?"
        message="Importar este arquivo substituirá todos os seus dados locais atuais. Considere exportar seus dados antes de continuar."
        confirmLabel="Importar"
        onConfirm={handleConfirmImport}
        onCancel={() => {
          setShowImportConfirm(false);
          setPendingImportData(null);
        }}
      />

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
