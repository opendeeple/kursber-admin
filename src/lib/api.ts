export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.kursber.uz';

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('admin_token', token);
  } else {
    localStorage.removeItem('admin_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('admin_token');
  }
  return authToken;
}

// MongoDB returns _id — normalize it to id throughout
function normalizeIds(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map(normalizeIds);
  }
  if (data !== null && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      result[key] = normalizeIds(obj[key]);
    }
    if ('_id' in result && !('id' in result)) {
      result['id'] = result['_id'];
      delete result['_id'];
    }
    return result;
  }
  return data;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  const json = await response.json();
  return normalizeIds(json) as T;
}

async function apiUpload<T>(endpoint: string, file: File, fieldName: string): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const form = new FormData();
  form.append(fieldName, file);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: form,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  const json = await response.json();
  return normalizeIds(json) as T;
}

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  user?: {
    id: string;
    username: string;
  };
}

export interface AdminStats {
  total_users: number;
  active_users: { count: number; date: string };
  new_users: { count: number; date: string };
  daily_clicks: { total: number; unique: number; date: string };
  clicks_by_provider: Array<{ provider_id: string; provider_name: string; count: number }>;
  clicks_by_transfer_type: Array<{ transfer_type_id: string; transfer_type_name: string; count: number }>;
}

export interface User {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  last_active_at?: string;
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Provider {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  is_trusted: boolean;
  is_featured: boolean;
  sort_order: number;
  link: string;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferType {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  provider: Provider;
  transfer_type: TransferType;
  rate: number;
  commission_percent: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  default_amount: number;
  show_card_tab: boolean;
  show_visa_tab: boolean;
  show_cash_tab: boolean;
}

export interface CreateProviderDto {
  name: string;
  slug: string;
  is_active?: boolean;
  is_trusted?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  link: string;
  icon_url?: string;
}

export interface UpdateProviderDto {
  name?: string;
  slug?: string;
  is_active?: boolean;
  is_trusted?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  link?: string;
  icon_url?: string;
}

export interface CreateTransferTypeDto {
  name: string;
  slug: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateTransferTypeDto {
  name?: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateExchangeRateDto {
  provider_id: string;
  transfer_type_id: string;
  rate: number;
  commission_percent?: number;
  is_active?: boolean;
}

export interface UpdateExchangeRateDto {
  provider_id?: string;
  transfer_type_id?: string;
  rate?: number;
  commission_percent?: number;
  is_active?: boolean;
}

export const adminApi = {
  async setup(credentials: AdminCredentials): Promise<AdminLoginResponse> {
    return apiRequest<AdminLoginResponse>('/api/v1/admin/setup', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async login(credentials: AdminCredentials): Promise<AdminLoginResponse> {
    return apiRequest<AdminLoginResponse>('/api/v1/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async getStats(date?: string): Promise<AdminStats> {
    const params = date ? `?date=${date}` : '';
    return apiRequest<AdminStats>(`/api/v1/admin/stats${params}`);
  },

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    date?: string;
  }): Promise<PaginatedUsers> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.date) searchParams.append('date', params.date);

    const query = searchParams.toString();
    return apiRequest<PaginatedUsers>(`/api/v1/admin/users${query ? `?${query}` : ''}`);
  },

  async getSettings(): Promise<Settings> {
    return apiRequest<Settings>('/api/v1/settings');
  },

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    return apiRequest<Settings>('/api/v1/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },
};

export const providersApi = {
  async getAll(): Promise<Provider[]> {
    return apiRequest<Provider[]>('/api/v1/providers');
  },

  async getOne(id: string): Promise<Provider> {
    return apiRequest<Provider>(`/api/v1/providers/${id}`);
  },

  async create(data: CreateProviderDto): Promise<Provider> {
    return apiRequest<Provider>('/api/v1/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateProviderDto): Promise<Provider> {
    return apiRequest<Provider>(`/api/v1/providers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/providers/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadIcon(id: string, file: File): Promise<Provider> {
    return apiUpload<Provider>(`/api/v1/providers/${id}/icon`, file, 'icon');
  },
};

export const transferTypesApi = {
  async getAll(): Promise<TransferType[]> {
    return apiRequest<TransferType[]>('/api/v1/transfer-types');
  },

  async getOne(id: string): Promise<TransferType> {
    return apiRequest<TransferType>(`/api/v1/transfer-types/${id}`);
  },

  async create(data: CreateTransferTypeDto): Promise<TransferType> {
    return apiRequest<TransferType>('/api/v1/transfer-types', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateTransferTypeDto): Promise<TransferType> {
    return apiRequest<TransferType>(`/api/v1/transfer-types/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/transfer-types/${id}`, {
      method: 'DELETE',
    });
  },
};

export const exchangeRatesApi = {
  async getAll(): Promise<ExchangeRate[]> {
    return apiRequest<ExchangeRate[]>('/api/v1/exchange-rates/all');
  },

  async getOne(id: string): Promise<ExchangeRate> {
    return apiRequest<ExchangeRate>(`/api/v1/exchange-rates/${id}`);
  },

  async create(data: CreateExchangeRateDto): Promise<ExchangeRate> {
    return apiRequest<ExchangeRate>('/api/v1/exchange-rates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateExchangeRateDto): Promise<ExchangeRate> {
    return apiRequest<ExchangeRate>(`/api/v1/exchange-rates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/v1/exchange-rates/${id}`, {
      method: 'DELETE',
    });
  },
};

