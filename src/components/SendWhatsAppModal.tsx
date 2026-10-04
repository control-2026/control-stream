import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  MessageSquare, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { StreamingAccount, EvolutionConfig } from '../types';
import { 
  buildWhatsAppMessage, 
  getDaysRemaining, 
  formatDateDisplay, 
  getWhatsAppWebUrl
} from '../utils';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: StreamingAccount | null;
  evolutionConfig: EvolutionConfig;
  onSendViaEvolution: (accountId: string, phone: string, message: string) => Promise<{ success: boolean; message: string }>;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  isOpen,
  onClose,
  account,
  evolutionConfig,
  onSendViaEvolution
}) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (account && isOpen) {
      setPhone(account.clientPhone || '');
      const built = buildWhatsAppMessage(evolutionConfig.messageTemplate, account);
      setMessage(built);
      setResult(null);
    }
  }, [account, isOpen, evolutionConfig]);

  if (!isOpen || !account) return null;

  const days = getDaysRemaining(account.expirationDate);

  const handleSendEvolution = async () => {
    if (!phone) {
      alert('Ingresa el número de WhatsApp del cliente.');
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const res = await onSendViaEvolution(account.id, phone, message);
      setResult(res);
      if (res.success) {
        setTimeout(() => {
          onClose();
        }, 1800);
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message || 'Error de envío' });
    } finally {
      setSending(false);
    }
  };

  const openWhatsAppWeb = () => {
    const url = getWhatsAppWebUrl(phone, message);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Enviar Aviso de Vencimiento por WhatsApp
              </h2>
              <p className="text-xs text-slate-500">
                MTC PROVEEDORES DE CUENTAS • Evolution API
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

        {/* Account Info Pill */}
        <div className="px-6 pt-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-slate-900 text-sm">
                {account.clientName} ({account.service})
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {account.profileName} • Vence: <strong className="text-slate-800">{formatDateDisplay(account.expirationDate)}</strong>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                days <= 2 ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse' : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}>
                {days === 0 ? '¡Vence Hoy!' : days === 1 ? '¡Vence Mañana!' : days === 2 ? 'Vence en 2 Días' : `${days} días`}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de WhatsApp (con código de país ej. +52, +57, +54...)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+5215541982341"
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contenido del Mensaje
            </label>
            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {result && (
            <div className={`p-3 rounded-lg text-xs border ${
              result.success 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={openWhatsAppWeb}
            className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-200 shadow-xs"
            title="Abrir en WhatsApp Web en una nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Abrir en WhatsApp Web</span>
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendEvolution}
              disabled={sending}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-200 transition disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${sending ? 'animate-pulse' : ''}`} />
              <span>{sending ? 'Enviando por Evolution...' : 'Enviar por Evolution API'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
