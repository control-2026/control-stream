import React, { useState, useEffect } from 'react';
import { 
  X, 
  Radio, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  Globe, 
  Sliders, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { EvolutionConfig } from '../types';

interface EvolutionApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EvolutionConfig;
  onSaveConfig: (config: EvolutionConfig) => void;
  onTestConnection: (cfg: { apiUrl: string; apiKey: string; instanceName: string }) => Promise<{ success: boolean; message: string }>;
  onSendTestMessage: (phone: string, text: string) => Promise<{ success: boolean; message: string }>;
  connectionStatus: boolean | null;
}

export const EvolutionApiModal: React.FC<EvolutionApiModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTestConnection,
  onSendTestMessage,
  connectionStatus
}) => {
  const [apiUrl, setApiUrl] = useState(config.apiUrl || '');
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [instanceName, setInstanceName] = useState(config.instanceName || '');
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState(config.autoNotifyEnabled ?? true);
  const [autoSendDaysBefore, setAutoSendDaysBefore] = useState(config.autoSendDaysBefore || 2);
  const [messageTemplate, setMessageTemplate] = useState(config.messageTemplate || '');

  // UI state
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Testing states
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [testPhone, setTestPhone] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [sendTestResult, setSendTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state whenever modal opens or config prop updates
  useEffect(() => {
    if (isOpen) {
      setApiUrl(config.apiUrl || '');
      setApiKey(config.apiKey || '');
      setInstanceName(config.instanceName || '');
      setAutoNotifyEnabled(config.autoNotifyEnabled ?? true);
      setAutoSendDaysBefore(config.autoSendDaysBefore || 2);
      setMessageTemplate(config.messageTemplate || '');
      setSavedSuccess(false);
      setTestResult(null);
      setSendTestResult(null);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const insertTag = (tag: string) => {
    setMessageTemplate(prev => prev + tag);
  };

  const handleSave = (shouldClose: boolean = false) => {
    const cleanConfig: EvolutionConfig = {
      apiUrl: apiUrl.trim(),
      apiKey: apiKey.trim(),
      instanceName: instanceName.trim(),
      autoNotifyEnabled,
      autoSendDaysBefore: Number(autoSendDaysBefore) || 2,
      messageTemplate
    };

    onSaveConfig(cleanConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      if (shouldClose) {
        onClose();
      }
    }, 1200);
  };

  const handleTestPing = async () => {
    const cleanUrl = apiUrl.trim();
    const cleanKey = apiKey.trim();
    const cleanInst = instanceName.trim();

    if (!cleanUrl || !cleanKey || !cleanInst) {
      alert('Ingresa la URL del servidor, API Key y Nombre de Instancia para probar la conexión.');
      return;
    }

    setTestingConnection(true);
    setTestResult(null);

    // Auto-save the credentials before testing so they don't get lost
    onSaveConfig({
      apiUrl: cleanUrl,
      apiKey: cleanKey,
      instanceName: cleanInst,
      autoNotifyEnabled,
      autoSendDaysBefore: Number(autoSendDaysBefore) || 2,
      messageTemplate
    });

    try {
      const res = await onTestConnection({ apiUrl: cleanUrl, apiKey: cleanKey, instanceName: cleanInst });
      setTestResult(res);
      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error al conectar' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      alert('Ingresa un número de WhatsApp para la prueba (con código de país, ej. +521...)');
      return;
    }
    setSendingTest(true);
    setSendTestResult(null);
    try {
      const sampleMsg = messageTemplate
        .replace(/{cliente}/g, 'Cliente de Prueba')
        .replace(/{servicio}/g, 'Disney+ Premium')
        .replace(/{correo}/g, 'cliente@prueba.com')
        .replace(/{perfil}/g, 'Perfil 1')
        .replace(/{pin}/g, '1234')
        .replace(/{dias_restantes}/g, '2 días')
        .replace(/{fecha_vencimiento}/g, '10 Oct 2026')
        .replace(/{precio}/g, '$9.00')
        .replace(/{metodo_pago}/g, 'Transferencia / Tarjeta')
        .replace(/{empresa}/g, 'MTC PROVEEDORES DE CUENTAS');

      const res = await onSendTestMessage(testPhone.trim(), sampleMsg);
      setSendTestResult(res);
    } catch (e: any) {
      setSendTestResult({ success: false, message: e.message || 'Fallo de envío' });
    } finally {
      setSendingTest(false);
    }
  };

  const hasSavedKeys = Boolean(config.apiUrl && config.apiKey && config.instanceName);

  const previewText = messageTemplate
    .replace(/{cliente}/g, 'Carlos Mendoza')
    .replace(/{servicio}/g, 'Disney+ Premium')
    .replace(/{correo}/g, 'cliente.vip@gmail.com')
    .replace(/{perfil}/g, 'Perfil 2')
    .replace(/{pin}/g, '1234')
    .replace(/{dias_restantes}/g, '2 días')
    .replace(/{fecha_vencimiento}/g, '10 Oct 2026')
    .replace(/{precio}/g, '$9.00')
    .replace(/{metodo_pago}/g, 'Transferencia / Tarjeta')
    .replace(/{empresa}/g, 'MTC PROVEEDORES DE CUENTAS');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-200 text-white">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Configuración de Evolution API
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  WhatsApp Automático
                </span>
                {hasSavedKeys && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-600" /> Claves Guardadas
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Avisos automáticos de vencimiento con 2 días de anticipación
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

        {/* Saved notification banner */}
        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 font-bold animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Claves y configuración de Evolution API guardadas con éxito en el sistema!</span>
            </div>
            <span className="text-[11px] font-normal text-emerald-600">Guardado persistente</span>
          </div>
        )}

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-h-[80vh] overflow-y-auto">
          
          {/* Left Form: Settings */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Credentials */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-600" /> Servidor Evolution API
                </span>
                
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  connectionStatus === true
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : connectionStatus === false
                    ? 'bg-rose-50 text-rose-700 border-rose-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}>
                  {connectionStatus === true ? '● Conectado' : connectionStatus === false ? '● Desconectado' : '● Sin probar'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL del Servidor Evolution API <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. https://whatsapp.midominio.com ó http://localhost:8080"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      API Key <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showApiKey ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                  </div>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="API Key de tu servidor"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre de Instancia <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="ej. mtc-cuentas"
                    value={instanceName}
                    onChange={(e) => setInstanceName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Action buttons inside credentials box */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={handleTestPing}
                  disabled={testingConnection}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? 'Probando...' : 'Probar Conexión'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition transform active:scale-95"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Claves Ahora</span>
                </button>
              </div>

              {testResult && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  testResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium' 
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  <div className="flex items-start gap-1.5">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Automation parameters: 2 days */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" /> Regla de Avisos Automáticos
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Avisar con anticipación de:
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={autoSendDaysBefore}
                      onChange={(e) => setAutoSendDaysBefore(parseInt(e.target.value) || 2)}
                      className="w-16 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-amber-900 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs font-bold text-slate-700">días antes de vencer</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 sm:pt-0">
                  <input
                    type="checkbox"
                    id="autoNotifyCheck"
                    checked={autoNotifyEnabled}
                    onChange={(e) => setAutoNotifyEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-0 border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="autoNotifyCheck" className="text-xs font-semibold text-slate-700 select-none cursor-pointer">
                    Habilitar alertas automáticas
                  </label>
                </div>
              </div>
            </div>

            {/* Template Editor */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Plantilla de Mensaje WhatsApp
                </span>
                <span className="text-[10px] text-slate-500">
                  Variables dinámicas
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { tag: '{cliente}', label: 'Cliente' },
                  { tag: '{servicio}', label: 'Streaming' },
                  { tag: '{dias_restantes}', label: 'Días Restantes' },
                  { tag: '{fecha_vencimiento}', label: 'Fecha Vencimiento' },
                  { tag: '{correo}', label: 'Correo' },
                  { tag: '{perfil}', label: 'Perfil' },
                  { tag: '{pin}', label: 'PIN' },
                  { tag: '{precio}', label: 'Precio' },
                  { tag: '{empresa}', label: 'MTC PROVEEDORES' }
                ].map(({ tag, label }) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => insertTag(tag)}
                    className="px-2 py-0.5 rounded bg-white hover:bg-indigo-50 text-indigo-700 text-[10px] font-mono font-semibold border border-slate-200 shadow-xs transition"
                  >
                    +{label}
                  </button>
                ))}
              </div>

              <textarea
                rows={6}
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="Escribe el mensaje que recibirá el cliente..."
              />
            </div>

            {/* Test WhatsApp sender */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-emerald-600" /> Enviar WhatsApp de Prueba
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Número de prueba (+521... ó +57...)"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleSendTest}
                  disabled={sendingTest}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 shadow-xs"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingTest ? 'animate-pulse' : ''}`} />
                  <span>{sendingTest ? 'Enviando...' : 'Enviar Prueba'}</span>
                </button>
              </div>

              {sendTestResult && (
                <div className={`p-2.5 rounded-lg text-xs border ${
                  sendTestResult.success 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}>
                  {sendTestResult.message}
                </div>
              )}
            </div>

          </div>

          {/* Right Phone Mockup Preview */}
          <div className="lg:col-span-5 flex flex-col items-center justify-start">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Vista Previa WhatsApp del Cliente
            </div>

            {/* Realistic Light WhatsApp Phone Screen */}
            <div className="w-full max-w-[320px] rounded-[32px] bg-slate-800 border-4 border-slate-700 shadow-xl overflow-hidden p-2">
              <div className="w-24 h-3.5 bg-slate-900 rounded-full mx-auto mb-2" />

              {/* WhatsApp Header */}
              <div className="bg-[#075e54] text-white p-3 rounded-t-xl flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center font-bold text-xs text-white">
                  MTC
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-bold text-xs truncate">MTC PROVEEDORES</div>
                  <div className="text-[10px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>en línea</span>
                  </div>
                </div>
              </div>

              {/* Chat Canvas in light wallpaper */}
              <div className="bg-[#efeae2] p-3 min-h-[360px] max-h-[420px] overflow-y-auto space-y-3 font-sans text-xs flex flex-col justify-start">
                <div className="text-center">
                  <span className="px-2 py-0.5 rounded-md bg-white text-[9px] text-slate-500 uppercase tracking-wider shadow-xs">
                    Hoy
                  </span>
                </div>

                {/* WhatsApp Chat Bubble (Light Green) */}
                <div className="bg-[#d9fdd3] text-[#111b21] rounded-lg p-3 max-w-[94%] shadow-xs self-start relative leading-relaxed whitespace-pre-wrap text-[11px] border border-emerald-100">
                  {previewText}
                  <div className="text-[9px] text-slate-500 text-right mt-1.5 flex items-center justify-end gap-1">
                    <span>10:30 a. m.</span>
                    <span className="text-[#53bdeb] font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Input Bar */}
              <div className="bg-[#f0f2f5] p-2 rounded-b-xl flex items-center justify-between text-slate-400 text-xs">
                <span>Escribe un mensaje...</span>
                <Send className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 text-center mt-3 max-w-[280px]">
              El cliente recibe este mensaje por WhatsApp a través de tu instancia de Evolution API exactamente 2 días antes de vencer su cuenta.
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            {hasSavedKeys ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Claves guardadas en la base de datos
              </span>
            ) : (
              <span>Ingresa tus datos y haz clic en Guardar Configuración</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 transition transform active:scale-95 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar y Cerrar</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
