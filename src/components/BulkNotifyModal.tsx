import React, { useState } from 'react';
import { 
  X, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Check, 
  Radio
} from 'lucide-react';
import { StreamingAccount, EvolutionConfig } from '../types';
import { 
  getDaysRemaining, 
  formatDateDisplay, 
  SERVICE_METADATA 
} from '../utils';

interface BulkNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: StreamingAccount[];
  evolutionConfig: EvolutionConfig;
  onBulkNotify: (selectedIds: string[]) => Promise<{ 
    success: boolean; 
    totalAttempted: number; 
    results?: any[]; 
    message: string;
  }>;
}

export const BulkNotifyModal: React.FC<BulkNotifyModalProps> = ({
  isOpen,
  onClose,
  accounts,
  evolutionConfig,
  onBulkNotify
}) => {
  const expiringAccounts = accounts.filter(acc => {
    if (acc.status === 'paused') return false;
    const days = getDaysRemaining(acc.expirationDate);
    return days <= (evolutionConfig.autoSendDaysBefore || 2) && days >= 0;
  });

  const [selectedIds, setSelectedIds] = useState<string[]>(() => expiringAccounts.map(a => a.id));
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<{
    success: boolean;
    totalAttempted: number;
    message: string;
    results?: any[];
  } | null>(null);

  if (!isOpen) return null;

  const toggleSelectAll = () => {
    if (selectedIds.length === expiringAccounts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(expiringAccounts.map(a => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExecute = async () => {
    if (selectedIds.length === 0) {
      alert('Selecciona al menos una cuenta para notificar.');
      return;
    }
    setRunning(true);
    setReport(null);
    try {
      const res = await onBulkNotify(selectedIds);
      setReport(res);
    } catch (e: any) {
      setReport({
        success: false,
        totalAttempted: selectedIds.length,
        message: e.message || 'Error en el proceso masivo'
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Disparar Avisos Automáticos WhatsApp (2 Días)
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Evolution API</span>
                <span>•</span>
                <span>MTC PROVEEDORES DE CUENTAS</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start space-x-3">
            <Radio className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Regla de 2 Días Activa:</span> Se detectaron{' '}
              <strong className="text-amber-800">{expiringAccounts.length} cuentas</strong> que vencen en 2 días o menos. Al disparar este proceso, Evolution API enviará automáticamente el recordatorio personalizado con credenciales y monto a cada cliente por WhatsApp.
            </div>
          </div>

          {expiringAccounts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900 text-sm">¡Al día! No hay cuentas por vencer en 2 días</div>
              <div className="text-xs text-slate-500 mt-1">
                Todas las cuentas registradas tienen más de 2 días de vigencia o ya fueron renovadas.
              </div>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-bold"
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedIds.length === expiringAccounts.length
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {selectedIds.length === expiringAccounts.length && <Check className="w-3 h-3" />}
                  </span>
                  <span>Seleccionar Todas ({expiringAccounts.length})</span>
                </button>
                <span>Seleccionadas: <strong className="text-slate-900">{selectedIds.length}</strong></span>
              </div>

              {/* List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {expiringAccounts.map((acc) => {
                  const days = getDaysRemaining(acc.expirationDate);
                  const isSelected = selectedIds.includes(acc.id);
                  const meta = SERVICE_METADATA[acc.service] || SERVICE_METADATA['Otro'];

                  return (
                    <div
                      key={acc.id}
                      onClick={() => toggleSelectOne(acc.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-50/60 border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 opacity-70'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div 
                          className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px] text-white shrink-0"
                          style={{ backgroundColor: meta.color }}
                        >
                          {acc.service.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{acc.clientName}</span>
                            <span className="text-slate-500 font-normal">({acc.service})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {acc.clientPhone || '⚠️ Sin teléfono configurado'} • {acc.profileName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          days === 0 ? 'bg-red-100 text-red-800' : days === 1 ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {days === 0 ? '¡Vence Hoy!' : days === 1 ? 'Vence Mañana' : 'Vence en 2 Días'}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Vence: {formatDateDisplay(acc.expirationDate)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {report && (
                <div className={`p-3 rounded-xl border text-xs ${
                  report.success ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {report.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{report.message}</span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Instancia: <strong className="font-mono text-indigo-700">{evolutionConfig.instanceName || 'Sin asignar'}</strong>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cerrar
            </button>
            {expiringAccounts.length > 0 && (
              <button
                type="button"
                onClick={handleExecute}
                disabled={running || selectedIds.length === 0}
                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-amber-200 transition disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
                <span>{running ? 'Enviando Avisos...' : `Disparar ${selectedIds.length} Avisos WhatsApp`}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
