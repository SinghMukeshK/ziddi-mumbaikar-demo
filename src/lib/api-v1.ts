const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
import { fixObjectUrls } from './image-utils';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, ...rest } = options;

  // Construct URL with query parameters
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Get auth token and tenant ID from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  const storedTenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
  const DEFAULT_TENANT_ID = '050a9c4a-ebf6-4897-b5fe-5fe8a2ce1317';
  const tenantId = storedTenantId || DEFAULT_TENANT_ID;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  if (tenantId) {
    defaultHeaders['tenant-id'] = tenantId;
    defaultHeaders['x-tenant-id'] = tenantId;
  }

  const response = await fetch(url, {
    ...rest,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error: any = new Error(errorData.error || errorData.message || `API request failed with status ${response.status}`);
    error.data = errorData.data;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();
  return fixObjectUrls(data) as T;
}

export const apiV1 = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),

  put: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(endpoint: string, body: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  get_base_url: () => BASE_URL,

  // For multi-part form data (file uploads)
  upload: async <T>(endpoint: string, formData: FormData, options: RequestOptions = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const storedTenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;
    const DEFAULT_TENANT_ID = '050a9c4a-ebf6-4897-b5fe-5fe8a2ce1317';
    const tenantId = storedTenantId || DEFAULT_TENANT_ID;
    const url = `${BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
      headers['tenant-id'] = tenantId;
      headers['x-tenant-id'] = tenantId;
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: {
        ...headers,
        ...options.headers as any,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return fixObjectUrls(data) as T;
  }
};
