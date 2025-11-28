import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { getAllIncidents, IncidentResponse } from '@/helpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const Incidents = () => {
  const [incidents, setIncidents] = useState<IncidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllIncidents();
      console.log('Incidentes cargados:', data);
      setIncidents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando incidentes:', error);
      setIncidents([]);
      setError('No se pudo cargar los incidentes. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImportanceText = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'Crítica';
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return importance;
    }
  };

  const getImportanceBgColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-destructive/10';
      case 'high':
        return 'bg-orange-500/10';
      case 'medium':
        return 'bg-warning/10';
      case 'low':
        return 'bg-blue-500/10';
      default:
        return 'bg-muted';
    }
  };

  const getImportanceTextColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'text-destructive';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
        <p className="text-muted-foreground">Registro de incidentes reportados en los equipos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Incidentes</CardTitle>
          <CardDescription>
            {incidents.length} incidente{incidents.length !== 1 ? 's' : ''} registrado{incidents.length !== 1 ? 's' : ''}
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
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertTriangle className="mb-4 h-16 w-16 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold">Sin incidentes</h3>
              <p className="text-sm text-muted-foreground">
                Aún no se han registrado incidentes en el inventario
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents
                .sort((a, b) => {
                  const dateA = new Date(a.created_at || 0).getTime();
                  const dateB = new Date(b.created_at || 0).getTime();
                  return dateB - dateA; // Más recientes primero
                })
                .map((incident) => (
                  <div
                    key={incident.id}
                    className="flex gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getImportanceBgColor(incident.importance)}`}>
                      {getImportanceIcon(incident.importance)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">
                              {incident.Equipment?.name || 'Equipo desconocido'}
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`${getImportanceTextColor(incident.importance)} border-current`}
                            >
                              {getImportanceText(incident.importance)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {incident.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            {incident.Equipment && (
                              <>
                                <span>Serial: {incident.Equipment.serial_number}</span>
                                <span>•</span>
                                <span>Tipo: {incident.Equipment.type}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              Registrado por: {incident.Profile?.full_name || incident.created_by || 'Desconocido'}
                            </span>
                            <span>•</span>
                            <span>
                              {format(new Date(incident.created_at || new Date()), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
                            </span>
                          </div>
                        </div>
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

export default Incidents;

