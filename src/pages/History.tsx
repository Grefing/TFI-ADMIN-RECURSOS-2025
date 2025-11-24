import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History as HistoryIcon, Package, Edit, Trash2, AlertCircle } from 'lucide-react';
import { getAllHistory, HistoryResponse } from '@/helpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

const History = () => {
  const [history, setHistory] = useState<HistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllHistory();
      console.log('Historial cargado:', data);
      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistory([]);
      setError('No se pudo cargar el historial. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <Package className="h-4 w-4 text-success" />;
      case 'update':
        return <Edit className="h-4 w-4 text-warning" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-destructive" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'create':
        return 'Creación';
      case 'update':
        return 'Actualización';
      case 'delete':
        return 'Eliminación';
      default:
        return action;
    }
  };

  const getActionBgColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-success/10';
      case 'update':
        return 'bg-warning/10';
      case 'delete':
        return 'bg-destructive/10';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Historial de Cambios</h1>
        <p className="text-muted-foreground">Registro completo de todas las operaciones realizadas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
          <CardDescription>
            {history.length} movimiento{history.length !== 1 ? 's' : ''} registrado{history.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <HistoryIcon className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">Sin historial</h3>
              <p className="text-sm text-muted-foreground">
                Aún no se han registrado cambios en el inventario
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {history
                .sort((a, b) => {
                  const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
                  const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
                  return dateB - dateA; // Más recientes primero
                })
                .map((entry) => (
                <div
                  key={entry.id}
                  className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getActionBgColor(entry.action)}`}>
                    {getActionIcon(entry.action)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">{entry.Equipment?.name || entry.equipmentName || 'Equipo'}</p>
                        <p className="text-sm text-muted-foreground">{entry.changes || entry.description || 'Sin descripción'}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-medium">
                        {getActionText(entry.action)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Usuario: {entry.Profile?.full_name || entry.user_name || entry.user || 'Desconocido'}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(entry.timestamp || entry.created_at || new Date()), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History;
