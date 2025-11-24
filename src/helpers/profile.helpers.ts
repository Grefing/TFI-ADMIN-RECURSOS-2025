import { apiClient } from './api.client';
import { setAuthToken } from './api.config';

// Tipos para las respuestas del API
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  UserRole?: {
    role: string;
  };
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    role?: string;
  };
  token: string;
}

export interface CreateProfileDto {
  email: string;
  password: string;
  full_name: string;
  avatar_url?: string;
}

export interface UpdateProfileDto {
  email?: string;
  password?: string;
  full_name?: string;
  avatar_url?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

/**
 * Inicia sesión con email y contraseña
 * @param credentials - Credenciales de login
 * @returns Respuesta con usuario y token
 */
export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/profile/login', credentials);
  
  // Guardar el token automáticamente
  if (response.token) {
    setAuthToken(response.token);
  }
  
  return response;
};

/**
 * Obtiene todos los perfiles
 * @returns Lista de perfiles
 */
export const getAllProfiles = async (): Promise<Profile[]> => {
  return apiClient.get<Profile[]>('/profile');
};

/**
 * Obtiene un perfil por su ID
 * @param id - ID del perfil
 * @returns Perfil con su rol
 */
export const getProfileById = async (id: string): Promise<Profile> => {
  return apiClient.get<Profile>(`/profile/${id}`);
};

/**
 * Crea un nuevo perfil
 * @param profile - Datos del perfil a crear
 * @returns Perfil creado
 */
export const createProfile = async (profile: CreateProfileDto): Promise<Profile> => {
  return apiClient.post<Profile>('/profile', profile);
};

/**
 * Actualiza un perfil existente
 * @param id - ID del perfil a actualizar
 * @param profile - Datos del perfil a actualizar
 * @returns Perfil actualizado
 */
export const updateProfile = async (id: string, profile: UpdateProfileDto): Promise<Profile> => {
  return apiClient.put<Profile>(`/profile/${id}`, profile);
};

/**
 * Elimina un perfil
 * @param id - ID del perfil a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteProfile = async (id: string): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/profile/${id}`);
};

