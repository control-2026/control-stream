import React from 'react';
import { 
  Tv, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  TrendingUp, 
  Send 
} from 'lucide-react';
import { StreamingAccount } from '../types';
import { getDaysRemaining, formatCurrency } from '../utils';

interface KpiCardsProps {
  accounts: StreamingAccount[];
  onOpenBulkNotify: () => void;
  onFilterExpiring: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  accounts,
  onOpenBulkNotify,
  onFilterExpiring
}) => {
  const total = accounts.length;

  let activeCount = 0;
  let expiringSoonCount = 0; // <= 2 days and >= 0
  let expiredCount = 0;
  let totalCost = 0;
  let totalPrice = 0;

  accounts.forEach((acc) => {
    const days = getDaysRemaining(acc.expirationDate);
    if (acc.status === 'paused') {
      return;
    }
    if (days < 0) {
      expiredCount++;
    } else {
      activeCount++;
      if (days <= 2) {
        expiringSoonCount++;
      }
    }

    totalCost += Number(acc.cost || 0);
    totalPrice += Number(acc.price || 0);
  });

  const estimatedProfit = totalPrice - totalCost;
  const marginPercent = totalPrice > 0 ? ((estimatedProfit / totalPrice) * 100).toFixed(0) : '0';

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      
      {/* 1. Total Cuentas */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cuentas</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <Tv className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-black text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">totales</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Registradas</div>
      </div>

      {/* 2. Cuentas Activas */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Activas</span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-black text-emerald-600">{activeCount}</span>
          <span className="text-xs text-emerald-700/80">al día</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Sin alertas</div>
      </div>

      {/* 3. Vencen en <= 2 Días (CORE FEATURE) */}
      <div 
        onClick={onFilterExpiring}
        className={`cursor-pointer rounded-xl p-4 transition-all duration-200 border ${
          expiringSoonCount > 0
            ? 'bg-amber-50/70 border-amber-300 shadow-sm hover:bg-amber-100/70'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Vencen ≤ 2d
          </span>
          {expiringSoonCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenBulkNotify();
              }}
              title="Disparar avisos WhatsApp con Evolution API"
              className="p-1 px-1.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-amber-600 transition shadow-xs"
            >
              <Send className="w-2.5 h-2.5" /> Avisar
            </button>
          )}
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-black text-amber-700">
            {expiringSoonCount}
          </span>
          <span className="text-xs text-amber-800/80">por avisar</span>
        </div>
        <div className="text-[11px] text-amber-700/80 font-medium mt-1">
          {expiringSoonCount > 0 ? '⚠️ Acción requerida' : 'Sin pendientes'}
        </div>
      </div>

      {/* 4. Vencidas */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vencidas</span>
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline space-x-1.5">
          <span className="text-2xl font-black text-rose-600">{expiredCount}</span>
          <span className="text-xs text-rose-700/80">expiradas</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">Requieren corte</div>
      </div>

      {/* 5. Inversión Proveedores */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo</span>
          <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-black text-slate-800">{formatCurrency(totalCost)}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">A proveedores</div>
      </div>

      {/* 6. Ganancia Neta */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ganancia</span>
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="text-xl font-black text-indigo-600">{formatCurrency(estimatedProfit)}</span>
        </div>
        <div className="text-[11px] text-indigo-700 font-semibold mt-1">
          Margen {marginPercent}%
        </div>
      </div>

    </div>
  );
};
