import { StreamingService, ServiceMeta, StreamingAccount } from '../types';

export const SERVICE_METADATA: Record<StreamingService, ServiceMeta> = {
  'Disney+': {
    name: 'Disney+',
    color: '#0063e5',
    bgLight: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    badge: 'Disney+ Premium'
  },
  'YouTube Premium': {
    name: 'YouTube Premium',
    color: '#ff0000',
    bgLight: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    badge: 'YouTube Premium'
  },
  'Netflix': {
    name: 'Netflix',
    color: '#e50914',
    bgLight: 'bg-rose-50',
    borderColor: 'border-rose-200',
    textColor: 'text-rose-700',
    badge: 'Netflix 4K'
  },
  'Max': {
    name: 'Max',
    color: '#002be7',
    bgLight: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    badge: 'Max Platino'
  },
  'Spotify': {
    name: 'Spotify',
    color: '#1db954',
    bgLight: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    badge: 'Spotify Premium'
  },
  'Prime Video': {
    name: 'Prime Video',
    color: '#00a8e1',
    bgLight: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-700',
    badge: 'Prime Video'
  },
  'Paramount+': {
    name: 'Paramount+',
    color: '#0064ff',
    bgLight: 'bg-sky-50',
    borderColor: 'border-sky-200',
    textColor: 'text-sky-700',
    badge: 'Paramount+'
  },
  'Apple TV+': {
    name: 'Apple TV+',
    color: '#1e293b',
    bgLight: 'bg-slate-100',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-800',
    badge: 'Apple TV+'
  },
  'Crunchyroll': {
    name: 'Crunchyroll',
    color: '#f47521',
    bgLight: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
    badge: 'Crunchyroll Fan'
  },
  'IPTV': {
    name: 'IPTV',
    color: '#8b5cf6',
    bgLight: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    badge: 'IPTV Pro'
  },
  'Canva Pro': {
    name: 'Canva Pro',
    color: '#00c4cc',
    bgLight: 'bg-teal-50',
    borderColor: 'border-teal-200',
    textColor: 'text-teal-700',
    badge: 'Canva Pro'
  },
  'Otro': {
    name: 'Otro',
    color: '#64748b',
    bgLight: 'bg-slate-100',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
    badge: 'Streaming / Servicio'
  }
};

/**
 * Calculates remaining days until expiration
 * Returns negative if expired, 0 if expires today, positive otherwise
 */
export function getDaysRemaining(expirationDate: string): number {
  if (!expirationDate) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expirationDate + 'T00:00:00');
  const diffTime = exp.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Categorizes the urgency status for clear light theme
 */
export function getExpirationBadge(days: number) {
  if (days < 0) {
    return {
      label: `Vencida (${Math.abs(days)}d)`,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      dotColor: 'bg-rose-500',
      urgent: false,
      expired: true
    };
  }
  if (days === 0) {
    return {
      label: '¡Vence Hoy!',
      color: 'bg-red-100 text-red-800 border-red-300 animate-pulse font-bold',
      dotColor: 'bg-red-500',
      urgent: true,
      expired: false
    };
  }
  if (days === 1) {
    return {
      label: '¡Vence Mañana! (1 día)',
      color: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse font-bold',
      dotColor: 'bg-amber-500',
      urgent: true,
      expired: false
    };
  }
  if (days === 2) {
    return {
      label: 'Vence en 2 días (Avisar)',
      color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      dotColor: 'bg-amber-500',
      urgent: true,
      expired: false
    };
  }
  if (days <= 5) {
    return {
      label: `Vence en ${days} días`,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      dotColor: 'bg-sky-500',
      urgent: false,
      expired: false
    };
  }
  return {
    label: `${days} días activos`,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-500',
    urgent: false,
    expired: false
  };
}

/**
 * Cleans phone number to digits only
 */
export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Builds the WhatsApp message text by replacing tags
 */
export function buildWhatsAppMessage(template: string, account: StreamingAccount): string {
  const days = getDaysRemaining(account.expirationDate);
  const remainingText = days === 0 ? 'hoy mismo' : days === 1 ? '1 día (mañana)' : `${days} días`;
  
  return template
    .replace(/{cliente}/g, account.clientName || 'Estimado cliente')
    .replace(/{servicio}/g, account.service === 'Otro' ? (account.customServiceName || 'Servicio Streaming') : account.service)
    .replace(/{correo}/g, account.email)
    .replace(/{perfil}/g, account.profileName || 'Principal')
    .replace(/{pin}/g, account.profilePin ? account.profilePin : 'Sin PIN')
    .replace(/{dias_restantes}/g, remainingText)
    .replace(/{fecha_vencimiento}/g, formatDateDisplay(account.expirationDate))
    .replace(/{precio}/g, formatCurrency(account.price))
    .replace(/{metodo_pago}/g, account.paymentMethod)
    .replace(/{empresa}/g, 'MTC PROVEEDORES DE CUENTAS');
}

/**
 * Generates direct WhatsApp Web link as a backup
 */
export function getWhatsAppWebUrl(phone: string, text: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Formats date into readable string e.g. "05 Oct 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'N/A';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parts[2];
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${day} ${months[monthIndex]} ${year}`;
    }
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/**
 * Currency formatter
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}
