import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  RefreshCw, 
  Edit2, 
  Trash2, 
  CreditCard, 
  Building2, 
  Send,
  PlusCircle,
  Tv
} from 'lucide-react';
import { StreamingAccount } from '../types';
import { 
  SERVICE_METADATA, 
  getDaysRemaining, 
  getExpirationBadge, 
  formatDateDisplay, 
  formatCurrency
} from '../utils';

interface AccountListProps {
  accounts: StreamingAccount[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  serviceFilter: string;
  setServiceFilter: (service: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  providerFilter: string;
  setProviderFilter: (provider: string) => void;
  onEditAccount: (account: StreamingAccount) => void;
  onDeleteAccount: (id: string) => void;
  onRenewAccount: (id: string, daysToAdd: number) => void;
  onOpenSendWhatsApp: (account: StreamingAccount) => void;
  onOpenNewAccount: () => void;
  whatsappTemplate: string;
}

export const AccountList: React.FC<AccountListProps> = ({
  accounts,
  searchTerm,
  setSearchTerm,
  serviceFilter,
  setServiceFilter,
  statusFilter,
  setStatusFilter,
  providerFilter,
  setProviderFilter,
  onEditAccount,
  onDeleteAccount,
  onRenewAccount,
  onOpenSendWhatsApp,
  onOpenNewAccount,
  whatsappTemplate
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyCredentials = (acc: StreamingAccount) => {
    const text = `🍿 *MTC PROVEEDORES DE CUENTAS*
Servicio: *${acc.service}* (${acc.planType})
👤 Perfil: *${acc.profileName}*
${acc.profilePin ? `🔑 PIN: *${acc.profilePin}*\n` : ''}📧 Correo: ${acc.email}
🔒 Contraseña: ${acc.password}
📅 Vencimiento: *${formatDateDisplay(acc.expirationDate)}*
⚠️ Recuerda renovar 2 días antes de tu fecha de corte. ¡Gracias por tu compra!`;

    navigator.clipboard.writeText(text);
    setCopiedId(acc.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const uniqueProviders = Array.from(new Set(accounts.map(a => a.providerName).filter(Boolean)));

  const filteredAccounts = accounts.filter(acc => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      acc.clientName.toLowerCase().includes(term) ||
      acc.email.toLowerCase().includes(term) ||
      acc.service.toLowerCase().includes(term) ||
      (acc.profileName && acc.profileName.toLowerCase().includes(term)) ||
      (acc.providerName && acc.providerName.toLowerCase().includes(term)) ||
      (acc.clientPhone && acc.clientPhone.includes(term));

    const matchesService = serviceFilter === 'all' || acc.service === serviceFilter;
    const matchesProvider = providerFilter === 'all' || acc.providerName === providerFilter;

    const days = getDaysRemaining(acc.expirationDate);
    let matchesStatus = true;
    if (statusFilter === 'expiring_soon') {
      matchesStatus = days <= 2 && days >= 0;
    } else if (statusFilter === 'expired') {
      matchesStatus = days < 0;
    } else if (statusFilter === 'active') {
      matchesStatus = days > 2;
    }

    return matchesSearch && matchesService && matchesProvider && matchesStatus;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, correo, streaming, perfil, teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todas las Plataformas</option>
            <option value="Disney+">Disney+</option>
            <option value="YouTube Premium">YouTube Premium</option>
            <option value="Netflix">Netflix</option>
            <option value="Max">Max</option>
            <option value="Spotify">Spotify</option>
            <option value="Prime Video">Prime Video</option>
            <option value="Paramount+">Paramount+</option>
            <option value="Apple TV+">Apple TV+</option>
            <option value="Crunchyroll">Crunchyroll</option>
            <option value="IPTV">IPTV</option>
            <option value="Canva Pro">Canva Pro</option>
            <option value="Otro">Otro</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none transition ${
              statusFilter === 'expiring_soon'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <option value="all">Todos los Vencimientos</option>
            <option value="expiring_soon">⚠️ Vencen en ≤ 2 Días</option>
            <option value="active">Activas (&gt; 2 Días)</option>
            <option value="expired">Vencidas</option>
          </select>

          {uniqueProviders.length > 0 && (
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los Proveedores</option>
              {uniqueProviders.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          )}

          {(searchTerm || serviceFilter !== 'all' || statusFilter !== 'all' || providerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setServiceFilter('all');
                setStatusFilter('all');
                setProviderFilter('all');
              }}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium transition"
            >
              Limpiar
            </button>
          )}

        </div>

      </div>

      {/* Account Table / Grid / Empty State */}
      {accounts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Tv className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No hay cuentas de streaming registradas
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-6">
            Comienza dando de alta tus cuentas de Disney+, YouTube Premium, Netflix, Spotify y más para controlar sus vencimientos y enviar avisos automáticos por WhatsApp a tus clientes con 2 días de anticipación.
          </p>
          <button
            onClick={onOpenNewAccount}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Registrar Primera Cuenta</span>
          </button>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-xs">
          <h3 className="text-sm font-bold text-slate-800">No se encontraron cuentas con los filtros actuales</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Intenta cambiar los términos de búsqueda o seleccionar "Todos los Vencimientos".
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Streaming & Plan</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Credenciales (Acceso)</th>
                  <th className="py-3 px-4">Vencimiento & Días</th>
                  <th className="py-3 px-4">Proveedor & Pago</th>
                  <th className="py-3 px-4">Precios</th>
                  <th className="py-3 px-4 text-right">Aviso WhatsApp & Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredAccounts.map((account) => {
                  const days = getDaysRemaining(account.expirationDate);
                  const badge = getExpirationBadge(days);
                  const meta = SERVICE_METADATA[account.service] || SERVICE_METADATA['Otro'];
                  const isPasswordVisible = visiblePasswords[account.id] || false;
                  const isExpiringWithin2Days = days <= 2 && days >= 0;

                  return (
                    <tr 
                      key={account.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isExpiringWithin2Days ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      {/* Streaming & Plan */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start space-x-3">
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: meta.color }}
                          >
                            {account.service.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {account.service === 'Otro' ? (account.customServiceName || 'Otro') : account.service}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium">
                              {account.planType}
                            </div>
                            {account.profileName && (
                              <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                <span>{account.profileName}</span>
                                {account.profilePin && (
                                  <span className="text-amber-700 font-bold ml-1">PIN: {account.profilePin}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{account.clientName || 'Sin asignar'}</span>
                        </div>
                        {account.clientPhone && (
                          <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                            {account.clientPhone}
                          </div>
                        )}
                        {account.clientNotes && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5 line-clamp-1">
                            "{account.clientNotes}"
                          </div>
                        )}
                      </td>

                      {/* Credenciales */}
                      <td className="py-3.5 px-4 align-top font-mono text-[11px]">
                        <div className="text-slate-800 font-medium truncate max-w-[170px]" title={account.email}>
                          {account.email}
                        </div>
                        <div className="flex items-center space-x-1.5 text-slate-500 mt-1">
                          <span>{isPasswordVisible ? account.password : '••••••••'}</span>
                          <button
                            onClick={() => togglePassword(account.id)}
                            className="text-slate-400 hover:text-slate-600 p-0.5"
                            title={isPasswordVisible ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Copy button */}
                        <button
                          onClick={() => copyCredentials(account)}
                          className="mt-1.5 inline-flex items-center space-x-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition"
                          title="Copiar datos para el cliente"
                        >
                          {copiedId === account.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">¡Ficha Copiada!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Ficha</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Vencimiento */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900">
                          {formatDateDisplay(account.expirationDate)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Alta: {formatDateDisplay(account.startDate)}
                        </div>
                        <div className="mt-1">
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
                            <span>{badge.label}</span>
                          </span>
                        </div>
                        {account.lastNotifiedAt && (
                          <div className="text-[10px] text-slate-500 mt-1">
                            Avisado: {new Date(account.lastNotifiedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                          </div>
                        )}
                      </td>

                      {/* Proveedor & Pago */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-purple-600" />
                          <span className="truncate max-w-[130px]">{account.providerName || 'N/A'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          <span>{account.paymentMethod}</span>
                        </div>
                        {account.paymentReference && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Ref: {account.paymentReference}
                          </div>
                        )}
                      </td>

                      {/* Precios */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {formatCurrency(account.price)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Costo: {formatCurrency(account.cost)}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                          +{formatCurrency(account.price - account.cost)}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Botón WhatsApp Aviso */}
                          <button
                            onClick={() => onOpenSendWhatsApp(account)}
                            className={`p-1.5 rounded-lg flex items-center space-x-1 font-bold text-xs transition ${
                              isExpiringWithin2Days
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 text-emerald-700 border border-slate-200'
                            }`}
                            title="Enviar aviso WhatsApp con Evolution API"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">
                              {isExpiringWithin2Days ? 'Avisar 2d' : 'WhatsApp'}
                            </span>
                          </button>

                          {/* Quick Renew +30 days */}
                          <button
                            onClick={() => onRenewAccount(account.id, 30)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 transition"
                            title="Renovar +30 días"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onEditAccount(account)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
                            title="Editar cuenta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar la cuenta de ${account.service} de ${account.clientName}?`)) {
                                onDeleteAccount(account.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition"
                            title="Eliminar cuenta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-xs text-slate-500">
            <div>
              Total: <strong className="text-slate-800">{filteredAccounts.length}</strong> de <strong className="text-slate-800">{accounts.length}</strong> cuentas
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Vence ≤ 2 días
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activa
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Vencida
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
