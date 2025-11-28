import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, Plus, Search, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { getAllEquipment, deleteEquipment as deleteEquipmentApi, createIncident } from '@/helpers';
import { EquipmentResponse } from '@/helpers/equipment.helpers';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Inventory = () => {
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [incidentDialogOpen, setIncidentDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentResponse | null>(null);
  const [incidentImportance, setIncidentImportance] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [submittingIncident, setSubmittingIncident] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    const filtered = equipment.filter(item =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assigned_user?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEquipment(filtered);
  }, [searchTerm, equipment]);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const data = await getAllEquipment();
      setEquipment(data);
      setFilteredEquipment(data);
    } catch (error) {
      console.error('Error cargando equipos:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      // Obtener información del equipo antes de eliminarlo para el historial
      await deleteEquipmentApi(id);
      // El backend ya crea automáticamente la entrada en el historial
      
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado correctamente.",
      });
      loadEquipment();
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleOpenIncidentDialog = (equipment: EquipmentResponse) => {
    setSelectedEquipment(equipment);
    setIncidentImportance('medium');
    setIncidentDescription('');
    setIncidentDialogOpen(true);
  };

  const handleSubmitIncident = async () => {
    if (!selectedEquipment || !incidentDescription.trim()) {
      toast({
        title: "Error",
        description: "Por favor, completa la descripción del incidente.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmittingIncident(true);
      await createIncident({
        equipment_id: selectedEquipment.id,
        importance: incidentImportance,
        description: incidentDescription.trim(),
      });

      toast({
        title: "Incidente registrado",
        description: "El incidente ha sido registrado correctamente.",
      });

      setIncidentDialogOpen(false);
      setSelectedEquipment(null);
      setIncidentDescription('');
      setIncidentImportance('medium');
    } catch (error) {
      console.error('Error registrando incidente:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el incidente. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmittingIncident(false);
    }
  };

  // Función para verificar si la garantía está vencida
  const isWarrantyExpired = (warrantyExpiration: string | undefined): boolean => {
    if (!warrantyExpiration) return false;
    const expirationDate = new Date(warrantyExpiration);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    return expirationDate < today;
  };

  // Función para verificar si la garantía está por vencer (3 meses antes)
  const isWarrantyExpiringSoon = (warrantyExpiration: string | undefined): boolean => {
    if (!warrantyExpiration) return false;
    if (isWarrantyExpired(warrantyExpiration)) return false; // Si ya está vencida, no mostrar como "por vencer"
    
    const expirationDate = new Date(warrantyExpiration);
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    today.setHours(0, 0, 0, 0);
    expirationDate.setHours(0, 0, 0, 0);
    threeMonthsFromNow.setHours(0, 0, 0, 0);
    
    // Está por vencer si la fecha de vencimiento está entre hoy y 3 meses desde hoy
    return expirationDate >= today && expirationDate <= threeMonthsFromNow;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">Gestión de equipos informáticos</p>
        </div>
        <Link to="/inventory/add">
          <Button size="lg" className="shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Equipo
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Equipos</CardTitle>
          <CardDescription>
            {equipment.length} equipo{equipment.length !== 1 ? 's' : ''} registrado{equipment.length !== 1 ? 's' : ''}
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, marca, serial o usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">No hay equipos</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'Comienza agregando tu primer equipo al inventario'}
              </p>
              {!searchTerm && (
                <Link to="/inventory/add">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Equipo
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEquipment.map((item) => {
                    const warrantyExpired = isWarrantyExpired(item.warranty_expiration);
                    const warrantyExpiringSoon = isWarrantyExpiringSoon(item.warranty_expiration);
                    
                    // Determinar el estilo de la fila
                    let rowClassName = '';
                    if (warrantyExpired) {
                      rowClassName = 'bg-destructive/5 border-l-4 border-l-destructive hover:bg-destructive/10';
                    } else if (warrantyExpiringSoon) {
                      rowClassName = 'bg-warning/5 border-l-4 border-l-warning hover:bg-warning/10';
                    }
                    
                    return (
                      <TableRow 
                        key={item.id}
                        className={rowClassName}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {item.name}
                            {warrantyExpired && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                Garantía vencida
                              </span>
                            )}
                            {warrantyExpiringSoon && !warrantyExpired && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                                <AlertTriangle className="h-3 w-3" />
                                Garantía por vencer
                              </span>
                            )}
                          </div>
                        </TableCell>
                      <TableCell className="capitalize">
                        {item.type === 'desktop' ? 'Escritorio' :
                         item.type === 'laptop' ? 'Portátil' :
                         item.type === 'server' ? 'Servidor' :
                         item.type === 'printer' ? 'Impresora' :
                         'Otro'}
                      </TableCell>
                      <TableCell>{item.brand} {item.model}</TableCell>
                      <TableCell className="font-mono text-sm">{item.serial_number}</TableCell>
                      <TableCell>{item.assigned_user}</TableCell>
                      <TableCell>{item.Location?.name || item.location_id}</TableCell>
                      <TableCell>
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          item.status === 'active' ? 'bg-success/10 text-success' :
                          item.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {item.status === 'active' ? 'Activo' :
                           item.status === 'maintenance' ? 'Mantenimiento' :
                           'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link to={`/inventory/edit/${item.id}`}>
                            <Button variant="ghost" size="icon" title="Editar">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenIncidentDialog(item)}
                            title="Registrar Incidente"
                          >
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Eliminar">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción eliminará permanentemente el equipo "{item.name}" del inventario.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para registrar incidente */}
      <Dialog open={incidentDialogOpen} onOpenChange={setIncidentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Incidente</DialogTitle>
            <DialogDescription>
              Registra un incidente para el equipo: <strong>{selectedEquipment?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="importance">Importancia *</Label>
              <Select value={incidentImportance} onValueChange={(value: 'critical' | 'high' | 'medium' | 'low') => setIncidentImportance(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la importancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción del Incidente *</Label>
              <Textarea
                id="description"
                placeholder="Describe detalladamente el incidente ocurrido..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIncidentDialogOpen(false)} disabled={submittingIncident}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitIncident} disabled={submittingIncident || !incidentDescription.trim()}>
              {submittingIncident ? 'Registrando...' : 'Registrar Incidente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
