// Configuración base del API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Función para obtener el token de autenticación desde localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Función para guardar el token de autenticación
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Función para eliminar el token de autenticación
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

