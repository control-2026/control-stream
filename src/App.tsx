import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { KpiCards } from './components/KpiCards';
import { AccountList } from './components/AccountList';
import { AccountModal } from './components/AccountModal';
import { EvolutionApiModal } from './components/EvolutionApiModal';
import { SendWhatsAppModal } from './components/SendWhatsAppModal';
import { BulkNotifyModal } from './components/BulkNotifyModal';
import { ProvidersView } from './components/ProvidersView';
import { AvisosView } from './components/AvisosView';
import { FinanzasView } from './components/FinanzasView';
import { 
  StreamingAccount, 
  Provider, 
  EvolutionConfig, 
  NotificationLog 
} from './types';
import { getDaysRemaining } from './utils';

// Local storage key (v2 for clean state without mock tests)
const STORAGE_KEY = 'mtc_cuentas_db_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cuentas' | 'avisos' | 'proveedores' | 'finanzas'>('cuentas');
  
  // Data starts 100% blank (sin pruebas)
  const [accounts, setAccounts] = useState<StreamingAccount[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [evolutionConfig, setEvolutionConfig] = useState<EvolutionConfig>({
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    autoNotifyEnabled: true,
    autoSendDaysBefore: 2,
    messageTemplate: `👋 Hola *{cliente}*, te saludamos de *MTC PROVEEDORES DE CUENTAS*.

⏳ Te recordamos que tu suscripción de *{servicio}* está próxima a vencer en *{dias_restantes}* (Fecha de corte: *{fecha_vencimiento}*).

📌 *Detalles de tu cuenta:*
📧 Correo: {correo}
👤 Perfil: {perfil}
🔑 PIN: {pin}
💰 Renovación: {precio}

💳 Para renovar y mantener tu pantalla sin interrupciones, responde a este mensaje. ¡Muchas gracias por tu preferencia!`
  });
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  
  // Evolution API live connection state
  const [evolutionConnected, setEvolutionConnected] = useState<boolean | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<StreamingAccount | null>(null);

  const [isEvolutionModalOpen, setIsEvolutionModalOpen] = useState(false);
  
  const [isSendWhatsAppModalOpen, setIsSendWhatsAppModalOpen] = useState(false);
  const [accountForWhatsApp, setAccountForWhatsApp] = useState<StreamingAccount | null>(null);

  const [isBulkNotifyModalOpen, setIsBulkNotifyModalOpen] = useState(false);

  // Fetch initial data from server or localStorage
  useEffect(() => {
    // Clear old mock storage from v1
    try {
      localStorage.removeItem('mtc_cuentas_db_v1');
    } catch {}

    // 1. Immediately read local dedicated evolution config for instantaneous load
    let localConfig: EvolutionConfig | null = null;
    try {
      const savedEvolution = localStorage.getItem('mtc_evolution_config');
      if (savedEvolution) {
        const parsed = JSON.parse(savedEvolution);
        if (parsed && (parsed.apiUrl || parsed.apiKey || parsed.instanceName)) {
          localConfig = parsed;
          setEvolutionConfig(prev => ({ ...prev, ...parsed }));
        }
      }
    } catch (e) {
      console.error(e);
    }

    async function initData() {
      try {
        // Fetch full data
        const res = await fetch('/api/data');
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setAccounts(json.data.accounts || []);
            setProviders(json.data.providers || []);
            setNotificationLogs(json.data.notificationLogs || []);

            // Check if server has config with keys
            const serverConfig = json.data.evolutionConfig;
            if (serverConfig && (serverConfig.apiUrl || serverConfig.apiKey || serverConfig.instanceName)) {
              setEvolutionConfig(serverConfig);
              localStorage.setItem('mtc_evolution_config', JSON.stringify(serverConfig));
            } else if (localConfig && (localConfig.apiUrl || localConfig.apiKey || localConfig.instanceName)) {
              // Server didn't have keys but localStorage did: push to server
              fetch('/api/evolution/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(localConfig)
              }).catch(() => {});
            }
            return;
          }
        }
      } catch (err) {
        console.warn('API /api/data not available, checking localStorage');
      }

      // Fallback localStorage
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          setAccounts(parsed.accounts || []);
          setProviders(parsed.providers || []);
          if (parsed.evolutionConfig && (parsed.evolutionConfig.apiUrl || parsed.evolutionConfig.apiKey)) {
            setEvolutionConfig(parsed.evolutionConfig);
          }
          setNotificationLogs(parsed.notificationLogs || []);
        } catch (e) {
          console.error(e);
        }
      }
    }

    initData();
  }, []);

  // Save changes to backend and localStorage
  const syncData = useCallback(async (
    newAccounts: StreamingAccount[],
    newProviders: Provider[],
    newConfig: EvolutionConfig,
    newLogs: NotificationLog[]
  ) => {
    const payload = {
      accounts: newAccounts,
      providers: newProviders,
      evolutionConfig: newConfig,
      notificationLogs: newLogs
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // offline/fallback
    }
  }, []);

  // Check Evolution API status once config is ready
  useEffect(() => {
    if (evolutionConfig.apiUrl && evolutionConfig.apiKey && evolutionConfig.instanceName) {
      testConnection({
        apiUrl: evolutionConfig.apiUrl,
        apiKey: evolutionConfig.apiKey,
        instanceName: evolutionConfig.instanceName
      }).then(res => {
        setEvolutionConnected(res.success);
      });
    } else {
      setEvolutionConnected(null);
    }
  }, [evolutionConfig.apiUrl, evolutionConfig.apiKey, evolutionConfig.instanceName]);

  // Test Evolution API connection
  const testConnection = async (cfg: { apiUrl: string; apiKey: string; instanceName: string }) => {
    try {
      const res = await fetch('/api/evolution/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg)
      });
      const data = await res.json();
      setEvolutionConnected(data.success);
      return data;
    } catch (err: any) {
      setEvolutionConnected(false);
      return { success: false, message: err.message || 'Error de red' };
    }
  };

  // Send WhatsApp message to single account via Evolution API
  const handleSendViaEvolution = async (accountId: string, phone: string, message: string) => {
    const acc = accounts.find(a => a.id === accountId);
    try {
      const res = await fetch('/api/evolution/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: evolutionConfig.apiUrl,
          apiKey: evolutionConfig.apiKey,
          instanceName: evolutionConfig.instanceName,
          number: phone,
          message,
          accountId,
          clientName: acc?.clientName || 'Cliente',
          service: acc?.service || 'Streaming'
        })
      });

      const data = await res.json();

      const updatedAccounts = accounts.map(a => {
        if (a.id === accountId) {
          return {
            ...a,
            lastNotifiedAt: new Date().toISOString(),
            notificationStatus: data.success ? 'sent' : 'failed',
            updatedAt: new Date().toISOString()
          } as StreamingAccount;
        }
        return a;
      });

      const newLog: NotificationLog = {
        id: 'log-' + Date.now(),
        accountId,
        clientName: acc?.clientName || 'Cliente',
        clientPhone: phone,
        service: acc?.service || 'Streaming',
        message,
        status: data.success ? 'success' : 'failed',
        error: data.error,
        sentAt: new Date().toISOString(),
        method: 'evolution_api'
      };

      const updatedLogs = [newLog, ...notificationLogs];

      setAccounts(updatedAccounts);
      setNotificationLogs(updatedLogs);
      syncData(updatedAccounts, providers, evolutionConfig, updatedLogs);

      return data;
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al conectar con Evolution API' };
    }
  };

  // Bulk notify accounts expiring in <= 2 days
  const handleBulkNotify = async (selectedIds: string[]) => {
    try {
      const res = await fetch('/api/evolution/bulk-notify-expiring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: evolutionConfig.apiUrl,
          apiKey: evolutionConfig.apiKey,
          instanceName: evolutionConfig.instanceName,
          customTemplate: evolutionConfig.messageTemplate,
          daysThreshold: evolutionConfig.autoSendDaysBefore || 2
        })
      });

      const json = await res.json();

      const dataRes = await fetch('/api/data');
      if (dataRes.ok) {
        const fresh = await dataRes.json();
        if (fresh.data) {
          setAccounts(fresh.data.accounts || []);
          setNotificationLogs(fresh.data.notificationLogs || []);
        }
      }

      return json;
    } catch (e: any) {
      return {
        success: false,
        totalAttempted: selectedIds.length,
        message: e.message || 'Error durante el envío masivo'
      };
    }
  };

  // Send single test WhatsApp message from Evolution settings
  const handleSendTestMessage = async (phone: string, text: string) => {
    try {
      const res = await fetch('/api/evolution/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: evolutionConfig.apiUrl,
          apiKey: evolutionConfig.apiKey,
          instanceName: evolutionConfig.instanceName,
          number: phone,
          message: text,
          clientName: 'Prueba Evolution',
          service: 'Prueba Sistema'
        })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Error al enviar prueba' };
    }
  };

  // Save or update account
  const handleSaveAccount = (accData: Partial<StreamingAccount>) => {
    let updated: StreamingAccount[];
    if (accountToEdit) {
      updated = accounts.map(a => {
        if (a.id === accountToEdit.id) {
          return {
            ...a,
            ...accData,
            updatedAt: new Date().toISOString()
          } as StreamingAccount;
        }
        return a;
      });
    } else {
      const newAcc: StreamingAccount = {
        id: 'acc-' + Date.now(),
        service: accData.service || 'Disney+',
        customServiceName: accData.customServiceName,
        planType: accData.planType || 'Perfil / Pantalla',
        profileName: accData.profileName || 'Perfil 1',
        profilePin: accData.profilePin,
        email: accData.email || '',
        password: accData.password || '',
        startDate: accData.startDate || new Date().toISOString().split('T')[0],
        expirationDate: accData.expirationDate || new Date().toISOString().split('T')[0],
        clientName: accData.clientName || 'Sin asignar',
        clientPhone: accData.clientPhone || '',
        clientNotes: accData.clientNotes,
        providerName: accData.providerName || 'General',
        providerContact: accData.providerContact,
        cost: Number(accData.cost) || 0,
        price: Number(accData.price) || 0,
        paymentMethod: accData.paymentMethod || 'Tarjeta Visa/MC',
        paymentReference: accData.paymentReference,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updated = [newAcc, ...accounts];
    }

    setAccounts(updated);
    syncData(updated, providers, evolutionConfig, notificationLogs);
    setAccountToEdit(null);
  };

  // Delete account
  const handleDeleteAccount = (id: string) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    syncData(updated, providers, evolutionConfig, notificationLogs);
  };

  // Quick renew account (+30 days, etc.)
  const handleRenewAccount = (id: string, daysToAdd: number = 30) => {
    const updated = accounts.map(a => {
      if (a.id === id) {
        const currentExp = new Date(a.expirationDate + 'T00:00:00');
        const now = new Date();
        const baseDate = currentExp > now ? currentExp : now;
        baseDate.setDate(baseDate.getDate() + daysToAdd);

        const newExpStr = baseDate.toISOString().split('T')[0];

        return {
          ...a,
          expirationDate: newExpStr,
          status: 'active',
          notificationStatus: 'pending',
          updatedAt: new Date().toISOString()
        } as StreamingAccount;
      }
      return a;
    });

    setAccounts(updated);
    syncData(updated, providers, evolutionConfig, notificationLogs);
  };

  // Save Evolution Config
  const handleSaveEvolutionConfig = async (newConfig: EvolutionConfig) => {
    setEvolutionConfig(newConfig);
    
    // 1. Save to dedicated localStorage key immediately
    try {
      localStorage.setItem('mtc_evolution_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
    }

    // 2. Save directly to dedicated backend endpoint
    try {
      await fetch('/api/evolution/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
    } catch (e) {
      console.warn('Could not post to /api/evolution/config:', e);
    }

    // 3. Sync to full database
    syncData(accounts, providers, newConfig, notificationLogs);

    // 4. Test connection immediately if parameters are present
    if (newConfig.apiUrl && newConfig.apiKey && newConfig.instanceName) {
      testConnection({
        apiUrl: newConfig.apiUrl,
        apiKey: newConfig.apiKey,
        instanceName: newConfig.instanceName
      });
    }
  };

  // Provider operations
  const handleAddProvider = (provData: Partial<Provider>) => {
    const newProv: Provider = {
      id: 'prov-' + Date.now(),
      name: provData.name || 'Nuevo Proveedor',
      contact: provData.contact,
      telegram: provData.telegram,
      paymentMethod: provData.paymentMethod,
      rating: provData.rating || 5,
      notes: provData.notes
    };
    const updated = [...providers, newProv];
    setProviders(updated);
    syncData(accounts, updated, evolutionConfig, notificationLogs);
  };

  const handleEditProvider = (prov: Provider) => {
    const updated = providers.map(p => p.id === prov.id ? prov : p);
    setProviders(updated);
    syncData(accounts, updated, evolutionConfig, notificationLogs);
  };

  const handleDeleteProvider = (id: string) => {
    const updated = providers.filter(p => p.id !== id);
    setProviders(updated);
    syncData(accounts, updated, evolutionConfig, notificationLogs);
  };

  // Export database
  const handleExportData = () => {
    const dataToExport = {
      app: 'MTC PROVEEDORES DE CUENTAS',
      exportedAt: new Date().toISOString(),
      accounts,
      providers,
      evolutionConfig,
      notificationLogs
    };
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MTC_Cuentas_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Count accounts expiring in <= 2 days
  const expiringCount = accounts.filter(acc => {
    if (acc.status === 'paused') return false;
    const days = getDaysRemaining(acc.expirationDate);
    return days <= (evolutionConfig.autoSendDaysBefore || 2) && days >= 0;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        expiringCount={expiringCount}
        openNewAccountModal={() => {
          setAccountToEdit(null);
          setIsAccountModalOpen(true);
        }}
        openEvolutionModal={() => setIsEvolutionModalOpen(true)}
        openBulkNotifyModal={() => setIsBulkNotifyModalOpen(true)}
        evolutionConfig={evolutionConfig}
        evolutionConnected={evolutionConnected}
        onExportData={handleExportData}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* KPI Cards */}
        <KpiCards
          accounts={accounts}
          onOpenBulkNotify={() => setIsBulkNotifyModalOpen(true)}
          onFilterExpiring={() => {
            setActiveTab('cuentas');
            setStatusFilter('expiring_soon');
          }}
        />

        {/* Tab 1: Cuentas Streaming */}
        {activeTab === 'cuentas' && (
          <AccountList
            accounts={accounts}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            serviceFilter={serviceFilter}
            setServiceFilter={setServiceFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            providerFilter={providerFilter}
            setProviderFilter={setProviderFilter}
            onEditAccount={(acc) => {
              setAccountToEdit(acc);
              setIsAccountModalOpen(true);
            }}
            onDeleteAccount={handleDeleteAccount}
            onRenewAccount={handleRenewAccount}
            onOpenSendWhatsApp={(acc) => {
              setAccountForWhatsApp(acc);
              setIsSendWhatsAppModalOpen(true);
            }}
            onOpenNewAccount={() => {
              setAccountToEdit(null);
              setIsAccountModalOpen(true);
            }}
            whatsappTemplate={evolutionConfig.messageTemplate}
          />
        )}

        {/* Tab 2: Avisos WhatsApp & Evolution API Logs */}
        {activeTab === 'avisos' && (
          <AvisosView
            accounts={accounts}
            logs={notificationLogs}
            evolutionConfig={evolutionConfig}
            onOpenEvolutionModal={() => setIsEvolutionModalOpen(true)}
            onOpenSendWhatsApp={(acc) => {
              setAccountForWhatsApp(acc);
              setIsSendWhatsAppModalOpen(true);
            }}
            onOpenBulkNotify={() => setIsBulkNotifyModalOpen(true)}
            evolutionConnected={evolutionConnected}
          />
        )}

        {/* Tab 3: Proveedores & Métodos de Pago */}
        {activeTab === 'proveedores' && (
          <ProvidersView
            providers={providers}
            accounts={accounts}
            onAddProvider={handleAddProvider}
            onEditProvider={handleEditProvider}
            onDeleteProvider={handleDeleteProvider}
          />
        )}

        {/* Tab 4: Finanzas & Métricas */}
        {activeTab === 'finanzas' && (
          <FinanzasView
            accounts={accounts}
            providers={providers}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-slate-700">MTC PROVEEDORES DE CUENTAS</strong> • Control de Cuentas Streaming & Evolution API WhatsApp
          </div>
          <div className="text-[11px] text-slate-400">
            Avisos automáticos a 2 días de corte • Disney+ • YouTube Premium • Netflix • Max • Spotify
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isAccountModalOpen && (
        <AccountModal
          isOpen={isAccountModalOpen}
          onClose={() => {
            setIsAccountModalOpen(false);
            setAccountToEdit(null);
          }}
          onSave={handleSaveAccount}
          accountToEdit={accountToEdit}
          existingProviders={providers}
        />
      )}

      {isEvolutionModalOpen && (
        <EvolutionApiModal
          isOpen={isEvolutionModalOpen}
          onClose={() => setIsEvolutionModalOpen(false)}
          config={evolutionConfig}
          onSaveConfig={handleSaveEvolutionConfig}
          onTestConnection={testConnection}
          onSendTestMessage={handleSendTestMessage}
          connectionStatus={evolutionConnected}
        />
      )}

      {isSendWhatsAppModalOpen && accountForWhatsApp && (
        <SendWhatsAppModal
          isOpen={isSendWhatsAppModalOpen}
          onClose={() => {
            setIsSendWhatsAppModalOpen(false);
            setAccountForWhatsApp(null);
          }}
          account={accountForWhatsApp}
          evolutionConfig={evolutionConfig}
          onSendViaEvolution={handleSendViaEvolution}
        />
      )}

      {isBulkNotifyModalOpen && (
        <BulkNotifyModal
          isOpen={isBulkNotifyModalOpen}
          onClose={() => setIsBulkNotifyModalOpen(false)}
          accounts={accounts}
          evolutionConfig={evolutionConfig}
          onBulkNotify={handleBulkNotify}
        />
      )}

    </div>
  );
}
