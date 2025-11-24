import { apiClient } from './api.client';

// Tipos para las respuestas del API
export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export interface UserRole {
  id: string | number;
  role: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  Profiles?: ProfileData[];
}

export interface CreateUserRoleDto {
  role: string;
  description?: string;
}

/**
 * Obtiene todos los roles de usuario
 * @returns Lista de roles con sus perfiles asociados
 */
export const getAllUserRoles = async (): Promise<UserRole[]> => {
  return apiClient.get<UserRole[]>('/userRole');
};

/**
 * Obtiene un rol por su ID
 * @param id - ID del rol
 * @returns Rol con sus perfiles asociados
 */
export const getRoleById = async (id: string | number): Promise<UserRole> => {
  return apiClient.get<UserRole>(`/userRole/${id}`);
};

/**
 * Crea un nuevo rol de usuario
 * @param role - Datos del rol a crear
 * @returns Rol creado
 */
export const createRole = async (role: CreateUserRoleDto): Promise<UserRole> => {
  return apiClient.post<UserRole>('/userRole', role);
};

