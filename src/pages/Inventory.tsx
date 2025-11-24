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
import { Package, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { getAllEquipment, deleteEquipment as deleteEquipmentApi, getEquipmentById, createHistoryEntry } from '@/helpers';
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

const Inventory = () => {
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
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
      let equipmentName = 'Equipo';
      try {
        const equipment = await getEquipmentById(id);
        equipmentName = equipment.name;
      } catch (error) {
        console.error('Error obteniendo equipo para historial:', error);
      }
      
      await deleteEquipmentApi(id);
      
      // Crear entrada de historial
      try {
        const historyResult = await createHistoryEntry({
          equipment_id: id,
          action: 'delete',
          changes: `Equipo eliminado: ${equipmentName}`,
          user_name: user?.full_name || user?.email || 'Usuario',
        });
        console.log('Historial de eliminación creado:', historyResult);
      } catch (historyError) {
        console.error('Error creando historial:', historyError);
        // No fallar la operación si el historial falla
      }
      
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
                  {filteredEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
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
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
