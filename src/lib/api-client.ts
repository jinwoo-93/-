import type { ApiResponse } from '@/types';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new ApiError(
      response.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || '알 수 없는 오류가 발생했습니다.',
      data.error?.details
    );
  }

  return data.data as T;
}

export const api = {
  // GET 요청
  get: async <T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> => {
    const url = new URL(`${API_BASE}${path}`, window.location.origin);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return handleResponse<T>(response);
  },

  // POST 요청
  post: async <T>(path: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  // PATCH 요청
  patch: async <T>(path: string, data?: unknown): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });

    return handleResponse<T>(response);
  },

  // DELETE 요청
  delete: async <T>(path: string): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    return handleResponse<T>(response);
  },

  // 파일 업로드
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    return handleResponse<T>(response);
  },
};

// 특정 API 함수들
export const postsApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get('/posts', params),
  get: (id: string) => api.get(`/posts/${id}`),
  create: (data: unknown) => api.post('/posts', data),
  update: (id: string, data: unknown) => api.patch(`/posts/${id}`, data),
  delete: (id: string) => api.delete(`/posts/${id}`),
};

export const ordersApi = {
  list: (params?: Record<string, string | number | undefined>) =>
    api.get('/orders', params),
  get: (id: string) => api.get(`/orders/${id}`),
  create: (data: unknown) => api.post('/orders', data),
  ship: (id: string, data: unknown) => api.patch(`/orders/${id}/ship`, data),
  confirm: (id: string) => api.patch(`/orders/${id}/confirm`),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

export const disputesApi = {
  get: (id: string) => api.get(`/disputes/${id}`),
  create: (data: unknown) => api.post('/disputes', data),
  vote: (id: string, data: unknown) => api.post(`/disputes/${id}/vote`, data),
  getVotes: (id: string) => api.get(`/disputes/${id}/votes`),
};

export const paymentsApi = {
  create: (data: unknown) => api.post('/payments/create', data),
  get: (id: string) => api.get(`/payments/${id}`),
};

export const shippingApi = {
  listCompanies: (params?: Record<string, string | number | undefined>) =>
    api.get('/shipping/companies', params),
  getCompany: (id: string) => api.get(`/shipping/companies/${id}`),
  createReview: (data: unknown) => api.post('/shipping/reviews', data),
};

export const adsApi = {
  listSlots: (params?: Record<string, string | number | undefined>) =>
    api.get('/ads/slots', params),
  getBids: (slotId: string) => api.get(`/ads/slots/${slotId}/bids`),
  createBid: (data: unknown) => api.post('/ads/bids', data),
  getMyBids: () => api.get('/ads/my-bids'),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: unknown) => api.patch('/users/me', data),
  getProfile: (id: string) => api.get(`/users/${id}`),
  submitBusiness: (data: unknown) => api.post('/users/me/business', data),
};

export const commonApi = {
  getCategories: () => api.get('/common/categories'),
  getExchangeRate: () => api.get('/common/exchange-rate'),
  upload: (formData: FormData) => api.upload('/common/upload', formData),
};

export const messagesApi = {
  list: (userId: string) => api.get(`/messages/${userId}`),
  send: (data: unknown) => api.post('/messages', data),
  markAsRead: (userId: string) => api.patch(`/messages/${userId}/read`),
  getConversations: () => api.get('/messages/conversations'),
};

export { ApiError };
