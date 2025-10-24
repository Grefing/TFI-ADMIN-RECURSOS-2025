import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Server, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { getEquipment, getHistory } from '@/utils/storage';
import { Equipment } from '@/types/equipment';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
    recentChanges: 0,
  });

  useEffect(() => {
    const data = getEquipment();
    const history = getHistory();
    
    setEquipment(data);
    setStats({
      total: data.length,
      active: data.filter(e => e.status === 'active').length,
      maintenance: data.filter(e => e.status === 'maintenance').length,
      inactive: data.filter(e => e.status === 'inactive').length,
      recentChanges: history.length,
    });
  }, []);

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            {equipment.length === 0 ? (
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
            {equipment.length === 0 ? (
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
    </div>
  );
};

export default Dashboard;
