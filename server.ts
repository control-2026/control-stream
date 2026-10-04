import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Persistent store file path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial clean data (empty/blank)
const DEFAULT_DATA = {
  accounts: [],
  providers: [],
  evolutionConfig: {
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
  },
  notificationLogs: []
};

// Helper to load or initialize data
function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading data file, using default:', err);
  }
  saveData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

function saveData(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving data file:', err);
    return false;
  }
}

// Normalize phone number for Evolution API (needs only digits and country code e.g. 5215541982341)
function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

// API Routes
app.get('/api/data', (_req, res) => {
  const data = loadData();
  res.json({ success: true, data });
});

app.post('/api/data', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid payload' });
  }
  const current = loadData();
  // Safe merge evolutionConfig so background accounts sync doesn't erase saved API keys
  let mergedEvolution = incoming.evolutionConfig;
  if (mergedEvolution) {
    mergedEvolution = {
      ...(current.evolutionConfig || {}),
      ...mergedEvolution,
      // If incoming apiUrl is provided, use it; otherwise preserve current
      apiUrl: mergedEvolution.apiUrl !== undefined && mergedEvolution.apiUrl !== '' ? mergedEvolution.apiUrl : (current.evolutionConfig?.apiUrl || ''),
      apiKey: mergedEvolution.apiKey !== undefined && mergedEvolution.apiKey !== '' ? mergedEvolution.apiKey : (current.evolutionConfig?.apiKey || ''),
      instanceName: mergedEvolution.instanceName !== undefined && mergedEvolution.instanceName !== '' ? mergedEvolution.instanceName : (current.evolutionConfig?.instanceName || '')
    };
  } else {
    mergedEvolution = current.evolutionConfig;
  }

  const mergedData = {
    ...current,
    ...incoming,
    evolutionConfig: mergedEvolution
  };

  saveData(mergedData);
  res.json({ success: true, message: 'Datos guardados correctamente' });
});

// Dedicated endpoints for Evolution API configuration
app.get('/api/evolution/config', (_req, res) => {
  const data = loadData();
  res.json({ success: true, config: data.evolutionConfig || {} });
});

app.post('/api/evolution/config', (req, res) => {
  const { apiUrl, apiKey, instanceName, autoNotifyEnabled, autoSendDaysBefore, messageTemplate } = req.body;
  const data = loadData();
  data.evolutionConfig = {
    ...(data.evolutionConfig || {}),
    apiUrl: apiUrl !== undefined ? apiUrl.trim() : (data.evolutionConfig?.apiUrl || ''),
    apiKey: apiKey !== undefined ? apiKey.trim() : (data.evolutionConfig?.apiKey || ''),
    instanceName: instanceName !== undefined ? instanceName.trim() : (data.evolutionConfig?.instanceName || ''),
    autoNotifyEnabled: autoNotifyEnabled !== undefined ? autoNotifyEnabled : (data.evolutionConfig?.autoNotifyEnabled ?? true),
    autoSendDaysBefore: autoSendDaysBefore !== undefined ? Number(autoSendDaysBefore) : (data.evolutionConfig?.autoSendDaysBefore || 2),
    messageTemplate: messageTemplate !== undefined ? messageTemplate : (data.evolutionConfig?.messageTemplate || '')
  };
  saveData(data);
  console.log('[Server] Configuración de Evolution API guardada exitosamente en store.json');
  res.json({
    success: true,
    message: '¡Claves y configuración de Evolution API guardadas con éxito!',
    config: data.evolutionConfig
  });
});

// Test Evolution API connection
app.post('/api/evolution/test', async (req, res) => {
  const { apiUrl, apiKey, instanceName } = req.body;

  if (!apiUrl || !apiKey || !instanceName) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros incompletos. Se requiere URL, API Key y Nombre de Instancia.'
    });
  }

  const cleanUrl = apiUrl.replace(/\/+$/, '');
  const testEndpoints = [
    `${cleanUrl}/instance/connectionState/${encodeURIComponent(instanceName)}`,
    `${cleanUrl}/instance/fetchInstances`
  ];

  let lastError = '';

  for (const endpoint of testEndpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (resp.ok) {
        const json = await resp.json().catch(() => ({}));
        return res.json({
          success: true,
          status: 'connected',
          message: '¡Conexión exitosa con Evolution API!',
          details: json
        });
      } else {
        const errorText = await resp.text().catch(() => '');
        lastError = `Status ${resp.status}: ${errorText || resp.statusText}`;
      }
    } catch (err: any) {
      lastError = err.message || 'Error de red o timeout al conectar con Evolution API';
    }
  }

  return res.status(502).json({
    success: false,
    status: 'error',
    error: `No se pudo conectar con Evolution API: ${lastError}`,
    suggestion: 'Verifica que el servidor de Evolution API esté encendido, la URL sea accesible y la API Key sea correcta.'
  });
});

// Send single WhatsApp message via Evolution API
app.post('/api/evolution/send', async (req, res) => {
  const {
    apiUrl,
    apiKey,
    instanceName,
    number,
    message,
    accountId,
    clientName,
    service
  } = req.body;

  if (!apiUrl || !apiKey || !instanceName || !number || !message) {
    return res.status(400).json({
      success: false,
      error: 'Faltan campos requeridos (apiUrl, apiKey, instanceName, number, message)'
    });
  }

  const cleanNumber = sanitizePhone(number);
  if (!cleanNumber || cleanNumber.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Número de teléfono inválido para WhatsApp'
    });
  }

  const cleanUrl = apiUrl.replace(/\/+$/, '');
  const sendEndpoint = `${cleanUrl}/message/sendText/${encodeURIComponent(instanceName)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    // Evolution API payload format
    const payload = {
      number: cleanNumber,
      text: message,
      textMessage: {
        text: message
      },
      options: {
        delay: 1200,
        presence: 'composing'
      }
    };

    const resp = await fetch(sendEndpoint, {
      method: 'POST',
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const logEntry = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      accountId: accountId || '',
      clientName: clientName || '',
      clientPhone: number,
      service: service || '',
      message,
      sentAt: new Date().toISOString(),
      method: 'evolution_api'
    };

    const data = loadData();

    if (resp.ok) {
      const jsonResponse = await resp.json().catch(() => ({}));
      
      // Update account status if accountId was provided
      if (accountId && data.accounts) {
        const acc = data.accounts.find((a: any) => a.id === accountId);
        if (acc) {
          acc.lastNotifiedAt = new Date().toISOString();
          acc.notificationStatus = 'sent';
          acc.updatedAt = new Date().toISOString();
        }
      }

      // Add to notification logs
      data.notificationLogs = [
        { ...logEntry, status: 'success' },
        ...(data.notificationLogs || []).slice(0, 100)
      ];
      saveData(data);

      return res.json({
        success: true,
        message: 'Mensaje enviado con éxito vía Evolution API',
        details: jsonResponse
      });
    } else {
      const errText = await resp.text().catch(() => '');
      
      data.notificationLogs = [
        { ...logEntry, status: 'failed', error: `HTTP ${resp.status}: ${errText}` },
        ...(data.notificationLogs || []).slice(0, 100)
      ];
      saveData(data);

      return res.status(resp.status).json({
        success: false,
        error: `Error de Evolution API (${resp.status}): ${errText || resp.statusText}`
      });
    }
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: `Fallo al enviar mensaje: ${err.message}`
    });
  }
});

// Bulk send notification to all accounts expiring in <= 2 days
app.post('/api/evolution/bulk-notify-expiring', async (req, res) => {
  const { apiUrl, apiKey, instanceName, customTemplate, daysThreshold = 2 } = req.body;
  const data = loadData();

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Filter accounts expiring in <= daysThreshold and >= 0 (or expired recently)
  const expiringAccounts = (data.accounts || []).filter((acc: any) => {
    if (!acc.expirationDate || acc.status === 'paused') return false;
    const exp = new Date(acc.expirationDate + 'T00:00:00');
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= Number(daysThreshold) && diffDays >= 0;
  });

  if (expiringAccounts.length === 0) {
    return res.json({
      success: true,
      count: 0,
      message: 'No hay cuentas próximas a vencer en 2 días o menos.'
    });
  }

  const results: any[] = [];
  const template = customTemplate || data.evolutionConfig?.messageTemplate || '';

  for (const acc of expiringAccounts) {
    const exp = new Date(acc.expirationDate + 'T00:00:00');
    const diffDays = Math.max(0, Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // Fill placeholders
    let msg = template
      .replace(/{cliente}/g, acc.clientName || 'Estimado cliente')
      .replace(/{servicio}/g, acc.service || 'Streaming')
      .replace(/{correo}/g, acc.email || '')
      .replace(/{perfil}/g, acc.profileName || 'Principal')
      .replace(/{pin}/g, acc.profilePin ? acc.profilePin : 'Sin PIN')
      .replace(/{dias_restantes}/g, String(diffDays))
      .replace(/{fecha_vencimiento}/g, acc.expirationDate || '')
      .replace(/{precio}/g, `$${acc.price ? acc.price.toFixed(2) : '0.00'}`)
      .replace(/{empresa}/g, 'MTC PROVEEDORES DE CUENTAS');

    const cleanPhone = sanitizePhone(acc.clientPhone);
    if (!cleanPhone) {
      results.push({
        id: acc.id,
        client: acc.clientName,
        status: 'skipped',
        reason: 'Sin teléfono configurado'
      });
      continue;
    }

    // Call Evolution API
    try {
      const cleanUrl = (apiUrl || data.evolutionConfig?.apiUrl || '').replace(/\/+$/, '');
      const inst = instanceName || data.evolutionConfig?.instanceName;
      const key = apiKey || data.evolutionConfig?.apiKey;

      const resp = await fetch(`${cleanUrl}/message/sendText/${encodeURIComponent(inst)}`, {
        method: 'POST',
        headers: {
          'apikey': key,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          number: cleanPhone,
          text: msg,
          textMessage: { text: msg },
          options: { delay: 1000, presence: 'composing' }
        })
      });

      if (resp.ok) {
        acc.lastNotifiedAt = new Date().toISOString();
        acc.notificationStatus = 'sent';
        results.push({ id: acc.id, client: acc.clientName, status: 'sent' });
      } else {
        const errTxt = await resp.text().catch(() => '');
        results.push({ id: acc.id, client: acc.clientName, status: 'failed', error: errTxt });
      }
    } catch (e: any) {
      results.push({ id: acc.id, client: acc.clientName, status: 'error', error: e.message });
    }

    // Small delay between requests to be gentle with WhatsApp
    await new Promise((r) => setTimeout(r, 600));
  }

  saveData(data);

  res.json({
    success: true,
    totalAttempted: expiringAccounts.length,
    results,
    message: `Proceso completado. Se procesaron ${expiringAccounts.length} avisos de vencimiento.`
  });
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
