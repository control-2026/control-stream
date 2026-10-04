import React from 'react';
import { 
  Tv, 
  Bell, 
  PlusCircle, 
  Settings, 
  Users, 
  PieChart, 
  Send,
  Database,
  Radio,
  AlertTriangle
} from 'lucide-react';
import { EvolutionConfig } from '../types';

interface HeaderProps {
  activeTab: 'cuentas' | 'avisos' | 'proveedores' | 'finanzas';
  setActiveTab: (tab: 'cuentas' | 'avisos' | 'proveedores' | 'finanzas') => void;
  expiringCount: number;
  openNewAccountModal: () => void;
  openEvolutionModal: () => void;
  openBulkNotifyModal: () => void;
  evolutionConfig: EvolutionConfig;
  evolutionConnected: boolean | null;
  onExportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  expiringCount,
  openNewAccountModal,
  openEvolutionModal,
  openBulkNotifyModal,
  evolutionConfig,
  evolutionConnected,
  onExportData
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top bar */}
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 text-white shrink-0">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  MTC <span className="text-indigo-600">PROVEEDORES DE CUENTAS</span>
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Streaming Hub
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span>Control de Cuentas y Vencimientos</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                  <Radio className="w-3 h-3 animate-pulse" /> Avisos WhatsApp 2 Días (Evolution API)
                </span>
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2.5">
            
            {/* Evolution API Status Badge */}
            <button
              onClick={openEvolutionModal}
              title="Configurar Evolution API de WhatsApp"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                evolutionConnected === true
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100'
                  : evolutionConnected === false
                  ? 'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100'
                  : (evolutionConfig.apiUrl && evolutionConfig.apiKey)
                  ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                  : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                evolutionConnected === true
                  ? 'bg-emerald-500 animate-pulse'
                  : evolutionConnected === false
                  ? 'bg-rose-500'
                  : (evolutionConfig.apiUrl && evolutionConfig.apiKey)
                  ? 'bg-blue-500'
                  : 'bg-amber-500'
              }`} />
              <span className="hidden md:inline">WhatsApp API:</span>
              <span>
                {evolutionConnected === true
                  ? 'Conectado'
                  : evolutionConnected === false
                  ? 'Desconectado'
                  : (evolutionConfig.apiUrl && evolutionConfig.apiKey)
                  ? 'Guardada'
                  : 'Configurar'}
              </span>
            </button>

            {/* Quick alert if expiring accounts exist */}
            {expiringCount > 0 && (
              <button
                onClick={openBulkNotifyModal}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold transition shadow-sm animate-pulse"
                title="Cuentas que vencen en 2 días o menos"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{expiringCount} Vencen ≤2d</span>
                <Send className="w-3 h-3 ml-0.5" />
              </button>
            )}

            {/* Backup / Export */}
            <button
              onClick={onExportData}
              title="Descargar copia de seguridad en JSON"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Evolution settings */}
            <button
              onClick={openEvolutionModal}
              title="Configuración de Evolution API"
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* CTA + Nueva Cuenta */}
            <button
              onClick={openNewAccountModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Alta Cuenta</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-100 pt-1 pb-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('cuentas')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'cuentas'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Cuentas Streaming</span>
          </button>

          <button
            onClick={() => setActiveTab('avisos')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition relative ${
              activeTab === 'avisos'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Avisos WhatsApp (2 Días)</span>
            {expiringCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full bg-amber-500 text-white">
                {expiringCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('proveedores')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'proveedores'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Proveedores & Pagos</span>
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'finanzas'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Balance & Métricas</span>
          </button>
        </div>

      </div>
    </header>
  );
};
