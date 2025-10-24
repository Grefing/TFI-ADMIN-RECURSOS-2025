import { Equipment, HistoryEntry } from '@/types/equipment';

const EQUIPMENT_KEY = 'equipment_inventory';
const HISTORY_KEY = 'equipment_history';

export const getEquipment = (): Equipment[] => {
  const data = localStorage.getItem(EQUIPMENT_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEquipment = (equipment: Equipment[]): void => {
  localStorage.setItem(EQUIPMENT_KEY, JSON.stringify(equipment));
};

export const addEquipment = (equipment: Equipment, user: string): void => {
  const allEquipment = getEquipment();
  allEquipment.push(equipment);
  saveEquipment(allEquipment);
  
  addHistoryEntry({
    id: crypto.randomUUID(),
    equipmentId: equipment.id,
    equipmentName: equipment.name,
    action: 'create',
    changes: `Equipo creado: ${equipment.name} (${equipment.type})`,
    user,
    timestamp: new Date().toISOString(),
  });
};

export const updateEquipment = (id: string, updatedEquipment: Equipment, user: string): void => {
  const allEquipment = getEquipment();
  const index = allEquipment.findIndex(eq => eq.id === id);
  
  if (index !== -1) {
    const oldEquipment = allEquipment[index];
    allEquipment[index] = updatedEquipment;
    saveEquipment(allEquipment);
    
    const changes = generateChangesSummary(oldEquipment, updatedEquipment);
    addHistoryEntry({
      id: crypto.randomUUID(),
      equipmentId: id,
      equipmentName: updatedEquipment.name,
      action: 'update',
      changes,
      user,
      timestamp: new Date().toISOString(),
    });
  }
};

export const deleteEquipment = (id: string, user: string): void => {
  const allEquipment = getEquipment();
  const equipment = allEquipment.find(eq => eq.id === id);
  
  if (equipment) {
    const filtered = allEquipment.filter(eq => eq.id !== id);
    saveEquipment(filtered);
    
    addHistoryEntry({
      id: crypto.randomUUID(),
      equipmentId: id,
      equipmentName: equipment.name,
      action: 'delete',
      changes: `Equipo eliminado: ${equipment.name}`,
      user,
      timestamp: new Date().toISOString(),
    });
  }
};

export const getHistory = (): HistoryEntry[] => {
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

const addHistoryEntry = (entry: HistoryEntry): void => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

const generateChangesSummary = (old: Equipment, updated: Equipment): string => {
  const changes: string[] = [];
  
  if (old.name !== updated.name) changes.push(`Nombre: ${old.name} → ${updated.name}`);
  if (old.location !== updated.location) changes.push(`Ubicación: ${old.location} → ${updated.location}`);
  if (old.assignedUser !== updated.assignedUser) changes.push(`Usuario: ${old.assignedUser} → ${updated.assignedUser}`);
  if (old.status !== updated.status) changes.push(`Estado: ${old.status} → ${updated.status}`);
  
  return changes.length > 0 ? changes.join(', ') : 'Actualización de datos';
};
