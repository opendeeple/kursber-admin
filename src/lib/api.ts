// Token helpers
const TOKEN_KEY = 'kursber_admin_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Types
export interface User {
  id: string;
  phone: string;
  full_name: string;
}

export interface TransferType {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_trusted: boolean;
  is_featured: boolean;
  sort_order: number;
  link: string | null;
  icon_url: string | null;
}

export interface ExchangeRate {
  id: string;
  provider_id: string;
  transfer_type_id: string;
  rate: number;
  commission_percent: number | null;
  is_active: boolean;
}

export interface Settings {
  default_amount: number;
  show_card_tab: boolean;
  show_visa_tab: boolean;
  show_cash_tab: boolean;
}

export interface AdminStats {
  total_users: number;
  active_users: number;
  daily_clicks: number;
  unique_clickers: number;
  new_users_today: number;
  new_users_this_week: number;
  new_users_this_month: number;
}

export interface AdminUser {
  id: string;
  name: string;
  phone: string;
  joined_date: string;
  last_active: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '';

// Base fetch wrapper (JSON)
async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const base = (import.meta.env.VITE_API_URL as string) ?? '';
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }

  return res;
}

// Multipart fetch wrapper (for file uploads — no Content-Type header so browser sets boundary)
async function apiFetchMultipart(path: string, options: RequestInit = {}): Promise<Response> {
  const base = (import.meta.env.VITE_API_URL as string) ?? '';
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${base}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? res.statusText);
  }

  return res;
}

// API methods
export const api = {
  auth: {
    signIn: async (phone: string, full_name: string): Promise<{ token: string }> => {
      const res = await apiFetch('/api/v1/auth', {
        method: 'POST',
        body: JSON.stringify({ phone, full_name }),
      });
      return res.json();
    },
  },

  users: {
    me: async (): Promise<User> => {
      const res = await apiFetch('/api/v1/users/me');
      return res.json();
    },
    updateMe: async (data: Partial<Pick<User, 'full_name' | 'phone'>>): Promise<User> => {
      const res = await apiFetch('/api/v1/users/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  transferTypes: {
    list: async (): Promise<TransferType[]> => {
      const res = await apiFetch('/api/v1/transfer-types');
      return res.json();
    },
    create: async (data: Omit<TransferType, 'id'>): Promise<TransferType> => {
      const res = await apiFetch('/api/v1/transfer-types', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Omit<TransferType, 'id'>>): Promise<TransferType> => {
      const res = await apiFetch(`/api/v1/transfer-types/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await apiFetch(`/api/v1/transfer-types/${id}`, { method: 'DELETE' });
    },
  },

  providers: {
    list: async (): Promise<Provider[]> => {
      const res = await apiFetch('/api/v1/providers');
      return res.json();
    },
    create: async (data: Omit<Provider, 'id'>): Promise<Provider> => {
      const res = await apiFetch('/api/v1/providers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Omit<Provider, 'id'>>): Promise<Provider> => {
      const res = await apiFetch(`/api/v1/providers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await apiFetch(`/api/v1/providers/${id}`, { method: 'DELETE' });
    },
    uploadIcon: async (id: string, file: File): Promise<Provider> => {
      const form = new FormData();
      form.append('icon', file);
      const res = await apiFetchMultipart(`/api/v1/providers/${id}/icon`, {
        method: 'POST',
        body: form,
      });
      return res.json();
    },
  },

  exchangeRates: {
    all: async (): Promise<ExchangeRate[]> => {
      const res = await apiFetch('/api/v1/exchange-rates/all');
      return res.json();
    },
    create: async (data: Omit<ExchangeRate, 'id'>): Promise<ExchangeRate> => {
      const res = await apiFetch('/api/v1/exchange-rates', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    update: async (id: string, data: Partial<Omit<ExchangeRate, 'id'>>): Promise<ExchangeRate> => {
      const res = await apiFetch(`/api/v1/exchange-rates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    delete: async (id: string): Promise<void> => {
      await apiFetch(`/api/v1/exchange-rates/${id}`, { method: 'DELETE' });
    },
  },

  settings: {
    get: async (): Promise<Settings> => {
      const res = await apiFetch('/api/v1/settings');
      return res.json();
    },
  },

  admin: {
    getStats: async (date?: string): Promise<AdminStats> => {
      const query = date ? `?date=${encodeURIComponent(date)}` : '';
      const res = await apiFetch(`/api/v1/admin/stats${query}`);
      return res.json();
    },
    getUsers: async (params: {
      page?: number;
      limit?: number;
      search?: string;
      date?: string;
    }): Promise<AdminUsersResponse> => {
      const qs = new URLSearchParams();
      if (params.page !== undefined) qs.set('page', String(params.page));
      if (params.limit !== undefined) qs.set('limit', String(params.limit));
      if (params.search) qs.set('search', params.search);
      if (params.date) qs.set('date', params.date);
      const query = qs.toString() ? `?${qs.toString()}` : '';
      const res = await apiFetch(`/api/v1/admin/users${query}`);
      return res.json();
    },
    updateSettings: async (data: Partial<Settings>): Promise<Settings> => {
      const res = await apiFetch('/api/v1/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },
};
