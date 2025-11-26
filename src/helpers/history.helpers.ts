import { apiClient } from './api.client';
import { HistoryEntry } from '@/types/equipment';

// Tipos para las respuestas del API
export interface HistoryResponse {
  id: string | number;
  equipment_id: string | number;
  equipment_name?: string; // Nombre del equipo guardado en el historial
  equipment_serial?: string; // Serial del equipo guardado en el historial
  user_name?: string;
  action: string;
  changes?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  created_at?: string;
  Equipment?: {
    name: string;
    serial_number: string;
  } | null; // Puede ser null si el equipo fue eliminado
  Profile?: {
    full_name: string;
  };
  // Campos legacy del tipo HistoryEntry para compatibilidad
  equipmentId?: string;
  equipmentName?: string;
  user?: string;
  timestamp?: string;
  description?: string;
}

export interface CreateHistoryDto {
  equipment_id: string | number;
  action: string;
  changes?: string;
  user_name?: string;
  description?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
}

/**
 * Obtiene todo el historial
 * @returns Lista de entradas de historial con sus relaciones
 */
export const getAllHistory = async (): Promise<HistoryResponse[]> => {
  return apiClient.get<HistoryResponse[]>('/history');
};

/**
 * Obtiene el historial de un equipo específico
 * @param equipmentId - ID del equipo
 * @returns Lista de entradas de historial del equipo
 */
export const getHistoryByEquipment = async (equipmentId: string | number): Promise<HistoryResponse[]> => {
  return apiClient.get<HistoryResponse[]>(`/history/${equipmentId}`);
};

/**
 * Crea una nueva entrada en el historial
 * @param history - Datos de la entrada de historial
 * @returns Entrada de historial creada
 */
export const createHistoryEntry = async (history: CreateHistoryDto): Promise<HistoryResponse> => {
  return apiClient.post<HistoryResponse>('/history', history);
};

