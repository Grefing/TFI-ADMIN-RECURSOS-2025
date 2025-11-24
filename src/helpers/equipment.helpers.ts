import { apiClient } from './api.client';
import { Equipment } from '@/types/equipment';

// Tipos para las respuestas del API
export interface SupplierData {
  id: string | number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface LocationData {
  id: string | number;
  name: string;
  description?: string;
  address?: string;
}

export interface HistoryData {
  id: string | number;
  equipment_id: string | number;
  action: string;
  changes?: string;
  user_id?: string;
  description?: string;
  created_at?: string;
}

// Tipo que refleja exactamente lo que devuelve el backend (snake_case)
export interface EquipmentResponse {
  id: string | number;
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  processor?: string;
  ram?: string;
  storage?: string;
  peripherals?: string[] | string;
  supplier_id?: string | number;
  purchase_date?: string;
  warranty_expiration?: string;
  location_id?: string | number;
  assigned_user?: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  incident_description?: string;
  Supplier?: SupplierData;
  Location?: LocationData;
  History?: HistoryData[];
}

export interface CreateEquipmentDto {
  name: string;
  type: string;
  brand: string;
  model: string;
  serial_number: string;
  processor?: string;
  ram?: string;
  storage?: string;
  peripherals?: string[];
  supplier_id?: string;
  purchase_date?: string;
  warranty_expiration?: string;
  location_id?: string;
  assigned_user?: string;
  status?: string;
  created_by?: string;
}

export type UpdateEquipmentDto = Partial<CreateEquipmentDto>;

/**
 * Obtiene todos los equipos
 * @returns Lista de equipos con sus relaciones (Supplier, Location, History)
 */
export const getAllEquipment = async (): Promise<EquipmentResponse[]> => {
  return apiClient.get<EquipmentResponse[]>('/equipment');
};

/**
 * Obtiene un equipo por su ID
 * @param id - ID del equipo
 * @returns Equipo con sus relaciones
 */
export const getEquipmentById = async (id: string | number): Promise<EquipmentResponse> => {
  return apiClient.get<EquipmentResponse>(`/equipment/${id}`);
};

/**
 * Crea un nuevo equipo
 * @param equipment - Datos del equipo a crear
 * @returns Respuesta con el equipo creado
 */
export const createEquipment = async (equipment: CreateEquipmentDto): Promise<{ message: string; data: EquipmentResponse }> => {
  return apiClient.post<{ message: string; data: EquipmentResponse }>('/equipment', equipment);
};

/**
 * Actualiza un equipo existente
 * @param id - ID del equipo a actualizar
 * @param equipment - Datos del equipo a actualizar
 * @returns Mensaje de confirmación
 */
export const updateEquipment = async (id: string | number, equipment: UpdateEquipmentDto): Promise<{ message: string }> => {
  return apiClient.put<{ message: string }>(`/equipment/${id}`, equipment);
};

/**
 * Elimina un equipo
 * @param id - ID del equipo a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteEquipment = async (id: string | number): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/equipment/${id}`);
};

