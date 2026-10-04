import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  User, 
  Calendar, 
  CreditCard, 
  Building2, 
  Mail, 
  Sparkles, 
  Phone
} from 'lucide-react';
import { StreamingAccount, StreamingService, PlanType, PaymentMethod, Provider } from '../types';
import { SERVICE_METADATA } from '../utils';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (account: Partial<StreamingAccount>) => void;
  accountToEdit?: StreamingAccount | null;
  existingProviders: Provider[];
}

const SERVICES: StreamingService[] = [
  'Disney+',
  'YouTube Premium',
  'Netflix',
  'Max',
  'Spotify',
  'Prime Video',
  'Paramount+',
  'Apple TV+',
  'Crunchyroll',
  'IPTV',
  'Canva Pro',
  'Otro'
];

const PLAN_TYPES: PlanType[] = [
  'Perfil / Pantalla',
  'Cuenta Completa',
  'Familiar',
  'Combo'
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Tarjeta Visa/MC',
  'PayPal',
  'Binance USDT',
  'Transferencia Bancaria',
  'Nequi / Daviplata',
  'Mercado Pago',
  'Efectivo',
  'Otro'
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accountToEdit,
  existingProviders
}) => {
  const [service, setService] = useState<StreamingService>('Disney+');
  const [customServiceName, setCustomServiceName] = useState('');
  const [planType, setPlanType] = useState<PlanType>('Perfil / Pantalla');
  const [profileName, setProfileName] = useState('Perfil 1');
  const [profilePin, setProfilePin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerContact, setProviderContact] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tarjeta Visa/MC');
  const [paymentReference, setPaymentReference] = useState('');

  useEffect(() => {
    if (accountToEdit) {
      setService(accountToEdit.service);
      setCustomServiceName(accountToEdit.customServiceName || '');
      setPlanType(accountToEdit.planType);
      setProfileName(accountToEdit.profileName || '');
      setProfilePin(accountToEdit.profilePin || '');
      setEmail(accountToEdit.email);
      setPassword(accountToEdit.password);
      setStartDate(accountToEdit.startDate);
      setExpirationDate(accountToEdit.expirationDate);
      setClientName(accountToEdit.clientName);
      setClientPhone(accountToEdit.clientPhone);
      setClientNotes(accountToEdit.clientNotes || '');
      setProviderName(accountToEdit.providerName);
      setProviderContact(accountToEdit.providerContact || '');
      setCost(accountToEdit.cost);
      setPrice(accountToEdit.price);
      setPaymentMethod(accountToEdit.paymentMethod);
      setPaymentReference(accountToEdit.paymentReference || '');
    } else {
      setService('Disney+');
      setCustomServiceName('');
      setPlanType('Perfil / Pantalla');
      setProfileName('Perfil 1');
      setProfilePin('');
      setEmail('');
      setPassword('');
      const today = new Date().toISOString().split('T')[0];
      setStartDate(today);
      const exp = new Date();
      exp.setDate(exp.getDate() + 30);
      setExpirationDate(exp.toISOString().split('T')[0]);
      setClientName('');
      setClientPhone('');
      setClientNotes('');
      setProviderName(existingProviders[0]?.name || '');
      setProviderContact(existingProviders[0]?.contact || '');
      setCost(0);
      setPrice(0);
      setPaymentMethod('Tarjeta Visa/MC');
      setPaymentReference('');
    }
  }, [accountToEdit, isOpen, existingProviders]);

  if (!isOpen) return null;

  const addDaysToExpiration = (days: number) => {
    const base = startDate ? new Date(startDate + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + days);
    setExpirationDate(base.toISOString().split('T')[0]);
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 10; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !expirationDate) {
      alert('Por favor completa al menos el correo y la fecha de vencimiento.');
      return;
    }

    onSave({
      service,
      customServiceName: service === 'Otro' ? customServiceName : undefined,
      planType,
      profileName,
      profilePin,
      email,
      password,
      startDate,
      expirationDate,
      clientName: clientName || 'Sin asignar',
      clientPhone,
      clientNotes,
      providerName: providerName || 'General',
      providerContact,
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      paymentMethod,
      paymentReference
    });

    onClose();
  };

  const profit = (Number(price) || 0) - (Number(cost) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {accountToEdit ? 'Editar Cuenta Streaming' : 'Alta de Cuenta de Streaming'}
              </h2>
              <p className="text-xs text-slate-500">
                MTC PROVEEDORES DE CUENTAS • Control y Vencimientos
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Service select */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Plataforma de Streaming
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SERVICES.map((s) => {
                const meta = SERVICE_METADATA[s];
                const isSelected = service === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setService(s)}
                    className={`flex items-center space-x-2 p-2 rounded-lg border text-xs font-bold transition ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: meta.color }} 
                    />
                    <span className="truncate">{s}</span>
                  </button>
                );
              })}
            </div>
            {service === 'Otro' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Nombre del servicio personalizado (ej. MagisTV, Deezer, etc.)"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Plan & Profile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Plan
              </label>
              <select
                value={planType}
                onChange={(e) => setPlanType(e.target.value as PlanType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                {PLAN_TYPES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de Perfil / Pantalla
              </label>
              <input
                type="text"
                placeholder="ej. Perfil 1, Pantalla 3"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN de Perfil (Opcional)
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="ej. 1234"
                value={profilePin}
                onChange={(e) => setProfilePin(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Credentials */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Credenciales de Acceso
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Correo / Usuario <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. cuenta@streaming.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">
                    Contraseña <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generar
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Dates: Start & Expiration (2 Days notice) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Control de Vencimiento
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fecha de Alta
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Fecha de Vencimiento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
              <span>Extender rápido:</span>
              <button
                type="button"
                onClick={() => addDaysToExpiration(30)}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-indigo-700 font-bold border border-slate-200 shadow-xs"
              >
                +30 Días (1 Mes)
              </button>
              <button
                type="button"
                onClick={() => addDaysToExpiration(60)}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-indigo-700 font-bold border border-slate-200 shadow-xs"
              >
                +60 Días (2 Meses)
              </button>
              <button
                type="button"
                onClick={() => addDaysToExpiration(365)}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 text-indigo-700 font-bold border border-slate-200 shadow-xs"
              >
                +1 Año
              </button>
            </div>
          </div>

          {/* Client & WhatsApp */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Cliente & WhatsApp (Avisos Evolution API)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  type="text"
                  placeholder="ej. Carlos Mendoza"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  WhatsApp (con código de país)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ej. +521... ó +57..."
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-emerald-700 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Notas del Cliente
              </label>
              <input
                type="text"
                placeholder="ej. Renovar por transferencia, cliente puntual"
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Provider & Pricing */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Proveedor & Finanzas
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre del Proveedor Mayorista
                </label>
                <input
                  type="text"
                  list="providers-datalist"
                  placeholder="ej. Alex Streaming Mayorista"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
                <datalist id="providers-datalist">
                  {existingProviders.map(p => (
                    <option key={p.id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contacto del Proveedor (WhatsApp / Telegram)
                </label>
                <input
                  type="text"
                  placeholder="ej. +52 55 1122 3344"
                  value={providerContact}
                  onChange={(e) => setProviderContact(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Método de Pago Usado
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Referencia / Tarjeta Usada
                </label>
                <input
                  type="text"
                  placeholder="ej. Visa *4421, Referencia #1234"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Costo Compra ($)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Precio Venta ($)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ganancia Neta
                </label>
                <div className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-indigo-700 flex items-center justify-between">
                  <span>+${profit.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500">
                    {price > 0 ? `${((profit / price) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition transform active:scale-95"
            >
              {accountToEdit ? 'Guardar Cambios' : 'Registrar Cuenta'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
