import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Tv, 
  Building2, 
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import { StreamingAccount, Provider } from '../types';
import { formatCurrency, SERVICE_METADATA } from '../utils';

interface FinanzasViewProps {
  accounts: StreamingAccount[];
  providers: Provider[];
}

export const FinanzasView: React.FC<FinanzasViewProps> = ({ accounts }) => {
  let totalCost = 0;
  let totalPrice = 0;

  const serviceStats: Record<string, { count: number; cost: number; price: number }> = {};

  accounts.forEach((acc) => {
    const cost = Number(acc.cost || 0);
    const price = Number(acc.price || 0);

    totalCost += cost;
    totalPrice += price;

    const s = acc.service || 'Otro';
    if (!serviceStats[s]) {
      serviceStats[s] = { count: 0, cost: 0, price: 0 };
    }
    serviceStats[s].count++;
    serviceStats[s].cost += cost;
    serviceStats[s].price += price;
  });

  const netProfit = totalPrice - totalCost;
  const marginPercent = totalPrice > 0 ? ((netProfit / totalPrice) * 100).toFixed(1) : '0';
  const averagePrice = accounts.length > 0 ? (totalPrice / accounts.length) : 0;
  const averageCost = accounts.length > 0 ? (totalCost / accounts.length) : 0;

  return (
    <div className="space-y-6">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Ingresos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ingresos Mensuales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{formatCurrency(totalPrice)}</span>
            <div className="text-xs text-emerald-700 flex items-center gap-1 mt-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Venta total a clientes</span>
            </div>
          </div>
        </div>

        {/* Costo Proveedores */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Costo Proveedores</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-800">{formatCurrency(totalCost)}</span>
            <div className="text-xs text-slate-500 mt-1">
              Inversión en compra de cuentas
            </div>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ganancia Neta</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-indigo-700">{formatCurrency(netProfit)}</span>
            <div className="text-xs text-indigo-800 font-bold mt-1">
              Margen de Utilidad: {marginPercent}%
            </div>
          </div>
        </div>

        {/* Ticket Promedio */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Tv className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-700">{formatCurrency(averagePrice)}</span>
            <div className="text-xs text-slate-500 mt-1">
              Costo medio: {formatCurrency(averageCost)}
            </div>
          </div>
        </div>

      </div>

      {/* Breakdown by Platform */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-indigo-600" />
          Rendimiento Financiero por Plataforma (Disney+, YouTube, etc.)
        </h3>

        {accounts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            Registra tus primeras cuentas de streaming para visualizar las métricas y márgenes por plataforma.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-bold text-slate-600 bg-slate-50">
                  <th className="py-3 px-4">Plataforma</th>
                  <th className="py-3 px-4">Cuentas</th>
                  <th className="py-3 px-4">Inversión (Costo)</th>
                  <th className="py-3 px-4">Venta (Ingreso)</th>
                  <th className="py-3 px-4">Utilidad Neta</th>
                  <th className="py-3 px-4 text-right">Margen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(serviceStats).map(([serviceName, data]) => {
                  const profit = data.price - data.cost;
                  const margin = data.price > 0 ? ((profit / data.price) * 100).toFixed(0) : '0';
                  const meta = (SERVICE_METADATA as Record<string, any>)[serviceName] || SERVICE_METADATA['Otro'];

                  return (
                    <tr key={serviceName} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: meta.color }} 
                        />
                        <span>{serviceName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-semibold">
                        {data.count}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatCurrency(data.cost)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(data.price)}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        +{formatCurrency(profit)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-indigo-700">
                        {margin}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
