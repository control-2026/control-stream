import React from 'react';
import { 
  Bell, 
  Send, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Settings, 
  Radio
} from 'lucide-react';
import { StreamingAccount, NotificationLog, EvolutionConfig } from '../types';
import { 
  getDaysRemaining, 
  formatDateDisplay, 
  formatCurrency, 
  SERVICE_METADATA 
} from '../utils';

interface AvisosViewProps {
  accounts: StreamingAccount[];
  logs: NotificationLog[];
  evolutionConfig: EvolutionConfig;
  onOpenEvolutionModal: () => void;
  onOpenSendWhatsApp: (account: StreamingAccount) => void;
  onOpenBulkNotify: () => void;
  evolutionConnected: boolean | null;
}

export const AvisosView: React.FC<AvisosViewProps> = ({
  accounts,
  logs,
  evolutionConfig,
  onOpenEvolutionModal,
  onOpenSendWhatsApp,
  onOpenBulkNotify,
  evolutionConnected
}) => {
  const expiringAccounts = accounts.filter(acc => {
    if (acc.status === 'paused') return false;
    const days = getDaysRemaining(acc.expirationDate);
    return days <= (evolutionConfig.autoSendDaysBefore || 2) && days >= 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Bell className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Avisos Automáticos WhatsApp (2 Días de Anticipación)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Módulo conectado con <strong className="text-emerald-700">Evolution API</strong> para enviar notificaciones de cobro y renovación exactamente 2 días antes de vencer las cuentas de Disney+, YouTube Premium, Netflix y demás plataformas.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenEvolutionModal}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
          >
            <Settings className="w-4 h-4" />
            <span>Configurar WhatsApp API</span>
          </button>

          {expiringAccounts.length > 0 && (
            <button
              onClick={onOpenBulkNotify}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-200 transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Notificar a los {expiringAccounts.length} de Hoy</span>
            </button>
          )}
        </div>
      </div>

      {/* Section 1: Cuentas próximas a vencer en <= 2 días */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Cuentas Próximas a Vencer en ≤ 2 Días ({expiringAccounts.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Regla de 2 días activa
          </span>
        </div>

        {expiringAccounts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-900">¡Al día! No hay cuentas por vencer en 2 días</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Todas las suscripciones activas cuentan con tiempo suficiente o ya fueron renovadas para el próximo mes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringAccounts.map((acc) => {
              const days = getDaysRemaining(acc.expirationDate);
              const meta = SERVICE_METADATA[acc.service] || SERVICE_METADATA['Otro'];

              return (
                <div 
                  key={acc.id}
                  className="bg-white border border-amber-300 rounded-xl p-4 flex flex-col justify-between hover:border-amber-400 transition shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-xs"
                          style={{ backgroundColor: meta.color }}
                        >
                          {acc.service.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {acc.service}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {acc.profileName}
                          </div>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        days === 0 ? 'bg-red-100 text-red-800' : days === 1 ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {days === 0 ? '¡Vence Hoy!' : days === 1 ? 'Vence Mañana (1d)' : 'Vence en 2 Días'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Cliente:</span>
                        <span className="font-bold text-slate-900">{acc.clientName}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-500">WhatsApp:</span>
                        <span className="text-emerald-700 font-bold">{acc.clientPhone || 'Sin número'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Vencimiento:</span>
                        <span className="text-slate-900 font-bold">{formatDateDisplay(acc.expirationDate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Renovación:</span>
                        <span className="text-slate-900 font-extrabold">{formatCurrency(acc.price)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      {acc.lastNotifiedAt ? `Avisado el ${new Date(acc.lastNotifiedAt).toLocaleDateString()}` : 'Aún no avisado'}
                    </span>
                    <button
                      onClick={() => onOpenSendWhatsApp(acc)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar Aviso</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Historial de Envíos WhatsApp (Logs) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-emerald-600" />
            Historial de Avisos WhatsApp Enviados ({logs.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Registro de confirmación
          </span>
        </div>

        {logs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500 shadow-xs">
            Aún no se han enviado avisos. Los mensajes enviados mediante Evolution API o WhatsApp Web se registrarán aquí automáticamente.
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4">Fecha y Hora</th>
                    <th className="py-2.5 px-4">Cliente</th>
                    <th className="py-2.5 px-4">Teléfono</th>
                    <th className="py-2.5 px-4">Streaming</th>
                    <th className="py-2.5 px-4">Método</th>
                    <th className="py-2.5 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 text-[11px] text-slate-500">
                        {new Date(log.sentAt).toLocaleString('es-ES', { 
                          month: 'short', 
                          day: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {log.clientName || 'Cliente'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">
                        {log.clientPhone}
                      </td>
                      <td className="py-2.5 px-4 font-medium">
                        {log.service}
                      </td>
                      <td className="py-2.5 px-4 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                          {log.method === 'evolution_api' ? 'Evolution API' : 'WhatsApp Web'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        {log.status === 'success' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700" title={log.error}>
                            <XCircle className="w-3.5 h-3.5" /> Fallido
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
