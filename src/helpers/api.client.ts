import axios, { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
import { API_BASE_URL, getAuthToken, removeAuthToken } from './api.config';

// Tipos para las respuestas de la API
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Clase de error personalizada para errores de API
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    const headers = (config.headers || {}) as AxiosRequestHeaders;
    headers['Authorization'] = token;
    config.headers = headers;
  }
  return config;
});

const mapAxiosError = (error: AxiosError<ApiResponse<unknown>>): never => {
  const status = error.response?.status ?? 500;

  if (status === 401) {
    removeAuthToken();
  }

  const data = error.response?.data;
  const message =
    (typeof data === 'object' && data !== null && ('error' in data || 'message' in data)
      ? (data.error as string) || (data.message as string)
      : undefined) || error.message || 'Error en la petición';

  throw new ApiError(
    status,
    status === 401 ? 'No autorizado. Por favor, inicia sesión nuevamente.' : message,
    data
  );
};

// Función helper para realizar peticiones HTTP usando Axios
async function fetchApi<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url: endpoint,
      ...config,
    });

    const data = (response.status === 204 ? null : response.data) as T;

    if (import.meta.env.DEV && endpoint.includes('/history')) {
      console.log('Respuesta del historial:', data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      mapAxiosError(error);
    }

    throw new ApiError(500, 'Error de conexión con el servidor');
  }
}

// Funciones helper para cada método HTTP
export const apiClient = {
  get: <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint, { method: 'GET' });
  },

  post: <T>(endpoint: string, body?: unknown): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'POST',
      data: body,
    });
  },

  put: <T>(endpoint: string, body?: unknown): Promise<T> => {
    return fetchApi<T>(endpoint, {
      method: 'PUT',
      data: body,
    });
  },

  delete: <T>(endpoint: string): Promise<T> => {
    return fetchApi<T>(endpoint, { method: 'DELETE' });
  },
};

