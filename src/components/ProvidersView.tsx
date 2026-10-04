import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Phone, 
  CreditCard, 
  Edit2, 
  Trash2, 
  Star, 
  Send 
} from 'lucide-react';
import { Provider, StreamingAccount } from '../types';
import { formatCurrency } from '../utils';

interface ProvidersViewProps {
  providers: Provider[];
  accounts: StreamingAccount[];
  onAddProvider: (prov: Partial<Provider>) => void;
  onEditProvider: (prov: Provider) => void;
  onDeleteProvider: (id: string) => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  providers,
  accounts,
  onAddProvider,
  onEditProvider,
  onDeleteProvider
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [telegram, setTelegram] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);

  const openNewModal = () => {
    setEditingProvider(null);
    setName('');
    setContact('');
    setTelegram('');
    setPaymentMethod('');
    setNotes('');
    setRating(5);
    setIsModalOpen(true);
  };

  const openEditModal = (prov: Provider) => {
    setEditingProvider(prov);
    setName(prov.name);
    setContact(prov.contact || '');
    setTelegram(prov.telegram || '');
    setPaymentMethod(prov.paymentMethod || '');
    setNotes(prov.notes || '');
    setRating(prov.rating || 5);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingProvider) {
      onEditProvider({
        ...editingProvider,
        name,
        contact,
        telegram,
        paymentMethod,
        notes,
        rating
      });
    } else {
      onAddProvider({
        name,
        contact,
        telegram,
        paymentMethod,
        notes,
        rating
      });
    }
    setIsModalOpen(false);
  };

  const paymentStats: Record<string, { count: number; totalCost: number }> = {};
  accounts.forEach(acc => {
    const method = acc.paymentMethod || 'Otro';
    if (!paymentStats[method]) {
      paymentStats[method] = { count: 0, totalCost: 0 };
    }
    paymentStats[method].count += 1;
    paymentStats[method].totalCost += Number(acc.cost || 0);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Proveedores Mayoristas & Métodos de Pago
            </h2>
            <p className="text-xs text-slate-500">
              Control de proveedores donde adquieres las cuentas de streaming y medios de pago utilizados.
            </p>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Proveedor</span>
        </button>
      </div>

      {/* Payment methods breakdown */}
      {Object.keys(paymentStats).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-indigo-600" /> Métodos de Pago Utilizados en Compras
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(paymentStats).map(([method, stat]) => (
              <div key={method} className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                <div className="text-xs font-bold text-slate-700 truncate">{method}</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-base font-black text-slate-900">{formatCurrency(stat.totalCost)}</span>
                  <span className="text-[11px] text-slate-500">{stat.count} cuentas</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Providers Directory */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-purple-600" /> Directorio de Proveedores ({providers.length})
        </h3>

        {providers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No hay proveedores registrados</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Registra los contactos de los proveedores mayoristas a quienes les compras tus cuentas para tener a mano sus teléfonos y garantías.
            </p>
            <button
              onClick={openNewModal}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-100 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Primer Proveedor</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.map((prov) => {
              const provAccounts = accounts.filter(a => a.providerName.toLowerCase() === prov.name.toLowerCase());
              const totalSpent = provAccounts.reduce((sum, a) => sum + Number(a.cost || 0), 0);

              return (
                <div 
                  key={prov.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{prov.name}</h4>
                        <div className="flex items-center space-x-1 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${
                                i < (prov.rating || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditModal(prov)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          title="Editar proveedor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar proveedor ${prov.name}?`)) {
                              onDeleteProvider(prov.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Eliminar proveedor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                      {prov.contact && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="font-mono font-medium text-slate-800">{prov.contact}</span>
                        </div>
                      )}
                      {prov.telegram && (
                        <div className="flex items-center space-x-2">
                          <Send className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-mono text-slate-800">{prov.telegram}</span>
                        </div>
                      )}
                      {prov.paymentMethod && (
                        <div className="flex items-center space-x-2">
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="truncate">{prov.paymentMethod}</span>
                        </div>
                      )}
                    </div>

                    {prov.notes && (
                      <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
                        "{prov.notes}"
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Cuentas:</span>{' '}
                      <strong className="text-slate-900">{provAccounts.length}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Inversión:</span>{' '}
                      <strong className="text-purple-700 font-bold">{formatCurrency(totalSpent)}</strong>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">
                {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor Mayorista'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nombre del Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Alex Streaming Mayorista"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Contacto WhatsApp</label>
                <input
                  type="text"
                  placeholder="+52 55 1122 3344"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Usuario Telegram</label>
                <input
                  type="text"
                  placeholder="@proveedor_streaming"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Métodos de Pago que Acepta</label>
                <input
                  type="text"
                  placeholder="Binance USDT, Tarjeta, Transferencia, PayPal"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Calificación de Confiabilidad (1-5)</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => setRating(n)}
                      className={`px-3 py-1.5 rounded-lg border font-bold ${
                        rating >= n ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      ★ {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notas y Garantías</label>
                <textarea
                  rows={3}
                  placeholder="Garantía de reposición, tiempos de respuesta, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
