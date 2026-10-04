export type StreamingService = 
  | 'Disney+'
  | 'YouTube Premium'
  | 'Netflix'
  | 'Max'
  | 'Spotify'
  | 'Prime Video'
  | 'Paramount+'
  | 'Apple TV+'
  | 'Crunchyroll'
  | 'IPTV'
  | 'Canva Pro'
  | 'Otro';

export type PlanType = 
  | 'Cuenta Completa'
  | 'Perfil / Pantalla'
  | 'Combo'
  | 'Familiar';

export type PaymentMethod = 
  | 'Tarjeta Visa/MC'
  | 'PayPal'
  | 'Binance USDT'
  | 'Transferencia Bancaria'
  | 'Nequi / Daviplata'
  | 'Mercado Pago'
  | 'Efectivo'
  | 'Otro';

export type AccountStatus = 'active' | 'expiring_soon' | 'expired' | 'paused';

export interface StreamingAccount {
  id: string;
  service: StreamingService;
  customServiceName?: string;
  planType: PlanType;
  profileName: string;
  profilePin?: string;
  email: string;
  password: string;
  startDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  providerName: string;
  providerContact?: string;
  cost: number;
  price: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
  status: AccountStatus;
  lastNotifiedAt?: string | null;
  notificationStatus?: 'pending' | 'sent' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  contact?: string;
  telegram?: string;
  paymentMethod?: string;
  services?: string[];
  rating?: number;
  notes?: string;
}

export interface EvolutionConfig {
  apiUrl: string;
  apiKey: string;
  instanceName: string;
  autoNotifyEnabled: boolean;
  autoSendDaysBefore: number;
  messageTemplate: string;
  lastCheckedAt?: string;
}

export interface NotificationLog {
  id: string;
  accountId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  message: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
  sentAt: string;
  method: 'evolution_api' | 'whatsapp_web';
}

export interface ServiceMeta {
  name: StreamingService;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  badge: string;
}
