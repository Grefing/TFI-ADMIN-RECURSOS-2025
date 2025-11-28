import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Server, AlertTriangle, CheckCircle, TrendingUp, Bell } from 'lucide-react';
import { getAllEquipment, getAllHistory, getAllIncidents } from '@/helpers';
import { EquipmentResponse } from '@/helpers/equipment.helpers';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const [equipment, setEquipment] = useState<EquipmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
    recentChanges: 0,
    incidents: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, historyData, incidentsData] = await Promise.all([
        getAllEquipment().catch(err => {
          console.error('Error cargando equipos:', err);
          return [];
        }),
        getAllHistory().catch(err => {
          console.error('Error cargando historial:', err);
          return [];
        }),
        getAllIncidents().catch(err => {
          console.error('Error cargando incidentes:', err);
          return [];
        })
      ]);
      
      console.log('Datos cargados - Equipos:', equipmentData.length, 'Historial:', historyData.length, 'Incidentes:', incidentsData.length);
      
      setEquipment(Array.isArray(equipmentData) ? equipmentData : []);
      setStats({
        total: Array.isArray(equipmentData) ? equipmentData.length : 0,
        active: Array.isArray(equipmentData) ? equipmentData.filter(e => e.status === 'active').length : 0,
        maintenance: Array.isArray(equipmentData) ? equipmentData.filter(e => e.status === 'maintenance').length : 0,
        inactive: Array.isArray(equipmentData) ? equipmentData.filter(e => e.status === 'inactive').length : 0,
        recentChanges: Array.isArray(historyData) ? historyData.length : 0,
        incidents: Array.isArray(incidentsData) ? incidentsData.length : 0,
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      setEquipment([]);
      setStats({
        total: 0,
        active: 0,
        maintenance: 0,
        inactive: 0,
        recentChanges: 0,
        incidents: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener equipos cuya garantía vence en 2025
  const getEquipmentWithWarrantyExpiringIn2025 = (): EquipmentResponse[] => {
    if (!equipment || equipment.length === 0) return [];
    
    const currentYear = new Date().getFullYear();
    const startOf2025 = new Date('2025-01-01');
    const endOf2025 = new Date('2025-12-31');
    endOf2025.setHours(23, 59, 59, 999);
    
    return equipment.filter((item) => {
      if (!item.warranty_expiration) return false;
      
      const warrantyDate = new Date(item.warranty_expiration);
      const today = new Date();
      
      // Solo incluir si la garantía vence en 2025 y aún no ha vencido
      return (
        warrantyDate >= startOf2025 &&
        warrantyDate <= endOf2025 &&
        warrantyDate >= today
      );
    }).sort((a, b) => {
      // Ordenar por fecha de vencimiento (más próximos primero)
      const dateA = new Date(a.warranty_expiration || 0).getTime();
      const dateB = new Date(b.warranty_expiration || 0).getTime();
      return dateA - dateB;
    });
  };

  const equipmentExpiring2025 = getEquipmentWithWarrantyExpiringIn2025();

  const statCards = [
    {
      title: 'Total de Equipos',
      value: stats.total,
      icon: Package,
      description: 'Equipos registrados',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Equipos Activos',
      value: stats.active,
      icon: CheckCircle,
      description: 'En operación',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'En Mantenimiento',
      value: stats.maintenance,
      icon: AlertTriangle,
      description: 'Requieren atención',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Incidentes Registrados',
      value: stats.incidents,
      icon: AlertTriangle,
      description: 'Incidentes reportados',
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      title: 'Cambios Recientes',
      value: stats.recentChanges,
      icon: TrendingUp,
      description: 'Movimientos registrados',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  return (
    <div className="space-y-6">
    
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen del inventario de equipos informáticos</p>
        </div>
        <Link to="/inventory/add">
          <Button size="lg" className="shadow-md">
            <Package className="mr-2 h-4 w-4" />
            Agregar Equipo
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className="transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Equipos Recientes</CardTitle>
            <CardDescription>Últimos equipos agregados al inventario</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : equipment.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Server className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">No hay equipos registrados</p>
                <Link to="/inventory/add">
                  <Button variant="outline" className="mt-4">Agregar primer equipo</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {equipment.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Package className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.type} - {item.brand}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      item.status === 'active' ? 'bg-success/10 text-success' :
                      item.status === 'maintenance' ? 'bg-warning/10 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {item.status === 'active' ? 'Activo' : 
                       item.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Tipo</CardTitle>
            <CardDescription>Categorías de equipos en el inventario</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : equipment.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">Sin datos para mostrar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {['desktop', 'laptop', 'server', 'printer', 'other'].map((type) => {
                  const count = equipment.filter(e => e.type === type).length;
                  const percentage = equipment.length > 0 ? (count / equipment.length) * 100 : 0;
                  
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">{
                          type === 'desktop' ? 'Escritorio' :
                          type === 'laptop' ? 'Portátil' :
                          type === 'server' ? 'Servidor' :
                          type === 'printer' ? 'Impresora' :
                          'Otro'
                        }</span>
                        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sección de equipos con garantía por vencer en 2025 */}
      <Card className="border-warning/20 bg-warning/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-warning/10 p-2">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Garantías por Vencer en 2025
                  {equipmentExpiring2025.length > 0 && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning">
                      {equipmentExpiring2025.length} {equipmentExpiring2025.length === 1 ? 'equipo' : 'equipos'}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Equipos cuya garantía vence durante el año 2025
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : equipmentExpiring2025.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="mb-4 h-12 w-12 text-success/50" />
              <p className="text-sm text-muted-foreground font-medium">
                No hay equipos con garantía por vencer en 2025
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Todos los equipos tienen garantía vigente más allá de 2025
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {equipmentExpiring2025.map((item) => {
                const warrantyDate = item.warranty_expiration 
                  ? new Date(item.warranty_expiration) 
                  : null;
                const daysUntilExpiration = warrantyDate 
                  ? Math.ceil((warrantyDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                // Determinar el nivel de urgencia
                const isUrgent = daysUntilExpiration !== null && daysUntilExpiration <= 90;
                const isWarning = daysUntilExpiration !== null && daysUntilExpiration <= 180;
                
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                      isUrgent 
                        ? 'border-destructive/50 bg-destructive/5 hover:bg-destructive/10' 
                        : isWarning
                        ? 'border-warning/50 bg-warning/5 hover:bg-warning/10'
                        : 'border-warning/20 bg-background hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`rounded-lg p-2 ${
                        isUrgent 
                          ? 'bg-destructive/10' 
                          : isWarning
                          ? 'bg-warning/10'
                          : 'bg-warning/5'
                      }`}>
                        <AlertTriangle className={`h-5 w-5 ${
                          isUrgent 
                            ? 'text-destructive animate-pulse' 
                            : isWarning
                            ? 'text-warning'
                            : 'text-warning/70'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-base">{item.name}</p>
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              URGENTE
                            </Badge>
                          )}
                          {isWarning && !isUrgent && (
                            <Badge variant="outline" className="bg-warning/10 text-warning border-warning text-xs">
                              PRÓXIMO
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Tipo:</span> {item.type === 'desktop' ? 'Escritorio' :
                             item.type === 'laptop' ? 'Portátil' :
                             item.type === 'server' ? 'Servidor' :
                             item.type === 'printer' ? 'Impresora' :
                             'Otro'}
                          </div>
                          <div>
                            <span className="font-medium">Marca:</span> {item.brand} {item.model}
                          </div>
                          <div>
                            <span className="font-medium">Serial:</span> <span className="font-mono text-xs">{item.serial_number}</span>
                          </div>
                          <div>
                            <span className="font-medium">Usuario:</span> {item.assigned_user || 'No asignado'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {warrantyDate && (
                        <>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Vence el:</p>
                            <p className={`font-semibold ${
                              isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-foreground'
                            }`}>
                              {format(warrantyDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                          </div>
                          {daysUntilExpiration !== null && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                isUrgent 
                                  ? 'border-destructive text-destructive bg-destructive/10' 
                                  : isWarning
                                  ? 'border-warning text-warning bg-warning/10'
                                  : 'border-muted-foreground/50'
                              }`}
                            >
                              {daysUntilExpiration === 0 
                                ? 'Vence hoy' 
                                : daysUntilExpiration === 1
                                ? 'Vence mañana'
                                : `${daysUntilExpiration} días restantes`
                              }
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
