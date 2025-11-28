import { apiClient } from './api.client';

// Tipos para las respuestas del API
export interface IncidentResponse {
  id: string | number;
  equipment_id: string | number;
  importance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  Equipment?: {
    id: string | number;
    name: string;
    serial_number: string;
    type: string;
    brand: string;
    model: string;
  };
  Profile?: {
    id: string | number;
    full_name: string;
    username?: string;
  };
}

export interface CreateIncidentDto {
  equipment_id: string | number;
  importance: 'critical' | 'high' | 'medium' | 'low';
  description: string;
}

export type UpdateIncidentDto = Partial<CreateIncidentDto>;

/**
 * Obtiene todos los incidentes
 * @returns Lista de incidentes con sus relaciones (Equipment, Profile)
 */
export const getAllIncidents = async (): Promise<IncidentResponse[]> => {
  return apiClient.get<IncidentResponse[]>('/incident');
};

/**
 * Obtiene un incidente por su ID
 * @param id - ID del incidente
 * @returns Incidente con sus relaciones
 */
export const getIncidentById = async (id: string | number): Promise<IncidentResponse> => {
  return apiClient.get<IncidentResponse>(`/incident/${id}`);
};

/**
 * Obtiene los incidentes de un equipo específico
 * @param equipmentId - ID del equipo
 * @returns Lista de incidentes del equipo
 */
export const getIncidentsByEquipment = async (equipmentId: string | number): Promise<IncidentResponse[]> => {
  return apiClient.get<IncidentResponse[]>(`/incident/equipment/${equipmentId}`);
};

/**
 * Crea un nuevo incidente
 * @param incident - Datos del incidente a crear
 * @returns Respuesta con el incidente creado
 */
export const createIncident = async (incident: CreateIncidentDto): Promise<{ message: string; data: IncidentResponse }> => {
  return apiClient.post<{ message: string; data: IncidentResponse }>('/incident', incident);
};

/**
 * Actualiza un incidente existente
 * @param id - ID del incidente a actualizar
 * @param incident - Datos del incidente a actualizar
 * @returns Mensaje de confirmación
 */
export const updateIncident = async (id: string | number, incident: UpdateIncidentDto): Promise<{ message: string }> => {
  return apiClient.put<{ message: string }>(`/incident/${id}`, incident);
};

/**
 * Elimina un incidente
 * @param id - ID del incidente a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteIncident = async (id: string | number): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/incident/${id}`);
};

