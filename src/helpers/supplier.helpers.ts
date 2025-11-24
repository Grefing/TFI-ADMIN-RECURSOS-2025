import { apiClient } from './api.client';

// Tipos para las respuestas del API
export interface Supplier {
  id: string | number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSupplierDto {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export type UpdateSupplierDto = Partial<CreateSupplierDto>;

/**
 * Obtiene todos los proveedores
 * @returns Lista de proveedores
 */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  return apiClient.get<Supplier[]>('/supplier');
};

/**
 * Obtiene un proveedor por su ID
 * @param id - ID del proveedor
 * @returns Proveedor
 */
export const getSupplierById = async (id: string | number): Promise<Supplier> => {
  return apiClient.get<Supplier>(`/supplier/${id}`);
};

/**
 * Crea un nuevo proveedor
 * @param supplier - Datos del proveedor a crear
 * @returns Proveedor creado
 */
export const createSupplier = async (supplier: CreateSupplierDto): Promise<Supplier> => {
  return apiClient.post<Supplier>('/supplier', supplier);
};

/**
 * Actualiza un proveedor existente
 * @param id - ID del proveedor a actualizar
 * @param supplier - Datos del proveedor a actualizar
 * @returns Proveedor actualizado
 */
export const updateSupplier = async (id: string | number, supplier: UpdateSupplierDto): Promise<Supplier> => {
  return apiClient.put<Supplier>(`/supplier/${id}`, supplier);
};

/**
 * Elimina un proveedor
 * @param id - ID del proveedor a eliminar
 * @returns Mensaje de confirmación
 */
export const deleteSupplier = async (id: string | number): Promise<{ message: string }> => {
  return apiClient.delete<{ message: string }>(`/supplier/${id}`);
};

