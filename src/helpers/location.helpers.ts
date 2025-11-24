import { apiClient } from './api.client';

// Tipos para las respuestas del API
export interface Location {
  id: string | number;
  name: string;
  description?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLocationDto {
  name: string;
  description?: string;
  address?: string;
}

export type UpdateLocationDto = Partial<CreateLocationDto>;

/**
 * Obtiene todas las ubicaciones
 * @returns Lista de ubicaciones
 */
export const getAllLocations = async (): Promise<Location[]> => {
  return apiClient.get<Location[]>('/location');
};

/**
 * Obtiene una ubicación por su ID
 * @param id - ID de la ubicación
 * @returns Ubicación
 */
export const getLocationById = async (id: string | number): Promise<Location> => {
  return apiClient.get<Location>(`/location/${id}`);
};

/**
 * Crea una nueva ubicación
 * @param location - Datos de la ubicación a crear
 * @returns Ubicación creada
 */
export const createLocation = async (location: CreateLocationDto): Promise<Location> => {
  return apiClient.post<Location>('/location', location);
};

/**
 * Actualiza una ubicación existente
 * @param id - ID de la ubicación a actualizar
 * @param location - Datos de la ubicación a actualizar
 * @returns Ubicación actualizada
 */
export const updateLocation = async (id: string | number, location: UpdateLocationDto): Promise<Location> => {
  return apiClient.put<Location>(`/location/${id}`, location);
};

/**
 * Elimina una ubicación
 * @param id - ID de la ubicación a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteLocation = async (id: string | number): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/location/${id}`);
};

