import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { Equipment } from "@/types/equipment";
import { createEquipment, updateEquipment as updateEquipmentApi, getEquipmentById, CreateEquipmentDto, getAllSuppliers, getAllLocations, Supplier, Location, EquipmentResponse } from "@/helpers";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);
  const [incidents, setIncidents] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentResponse | null>(null);
  const params = useParams();


  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<Equipment>();
  const watchType = watch("type");
  
  useEffect(() => {
    const initialize = async () => {
      await loadSuppliersAndLocations();
      if (id) {
        setIsEdit(true);
        loadEquipment(id);
      }
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Efecto para establecer supplier y location cuando se carguen los datos
  useEffect(() => {
    if (equipmentData && suppliers.length > 0 && locations.length > 0) {
      // Usar el ID del supplier
      let supplierId = "";
      if (equipmentData.supplier_id) {
        supplierId = String(equipmentData.supplier_id);
      } else if (equipmentData.Supplier?.id) {
        supplierId = String(equipmentData.Supplier.id);
      }
      if (supplierId) {
        setValue("supplier", supplierId);
      }

      // Usar el ID de la location
      let locationId = "";
      if (equipmentData.location_id) {
        locationId = String(equipmentData.location_id);
      } else if (equipmentData.Location?.id) {
        locationId = String(equipmentData.Location.id);
      }
      if (locationId) {
        setValue("location", locationId);
      }
    }
  }, [equipmentData, suppliers, locations, setValue]);

  const loadSuppliersAndLocations = async () => {
    try {
      const [suppliersData, locationsData] = await Promise.all([
        getAllSuppliers(),
        getAllLocations()
      ]);
      setSuppliers(suppliersData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error cargando suppliers y locations:', error);
    }
  };

  const generateChangesSummary = (oldEquipment: EquipmentResponse, newEquipment: CreateEquipmentDto): string => {
    const changes: string[] = [];
    
    if (oldEquipment.name !== newEquipment.name) {
      changes.push(`Nombre: ${oldEquipment.name} → ${newEquipment.name}`);
    }
    if (oldEquipment.type !== newEquipment.type) {
      changes.push(`Tipo: ${oldEquipment.type} → ${newEquipment.type}`);
    }
    if (oldEquipment.brand !== newEquipment.brand) {
      changes.push(`Marca: ${oldEquipment.brand} → ${newEquipment.brand}`);
    }
    if (oldEquipment.model !== newEquipment.model) {
      changes.push(`Modelo: ${oldEquipment.model} → ${newEquipment.model}`);
    }
    if (oldEquipment.serial_number !== newEquipment.serial_number) {
      changes.push(`Serial: ${oldEquipment.serial_number} → ${newEquipment.serial_number}`);
    }
    if (oldEquipment.status !== newEquipment.status) {
      changes.push(`Estado: ${oldEquipment.status} → ${newEquipment.status}`);
    }
    if (oldEquipment.assigned_user !== newEquipment.assigned_user) {
      changes.push(`Usuario: ${oldEquipment.assigned_user} → ${newEquipment.assigned_user}`);
    }
    if (String(oldEquipment.supplier_id) !== String(newEquipment.supplier_id)) {
      changes.push(`Proveedor actualizado`);
    }
    if (String(oldEquipment.location_id) !== String(newEquipment.location_id)) {
      changes.push(`Ubicación actualizada`);
    }
    
    return changes.length > 0 ? changes.join(', ') : 'Actualización de datos del equipo';
  };

  const loadEquipment = async (equipmentId: string) => {
    try {
      setLoading(true);
      const equipment = await getEquipmentById(equipmentId);
      
      // Guardar los datos del equipo para usarlos cuando se carguen suppliers y locations
      setEquipmentData(equipment);
      
      // Mapear datos del backend al formulario
      setValue("name", equipment.name);
      setValue("type", equipment.type as Equipment["type"]);
      setValue("brand", equipment.brand);
      setValue("model", equipment.model);
      setValue("serialNumber", equipment.serial_number);
      setValue("processor", equipment.processor || "");
      setValue("ram", equipment.ram || "");
      setValue("storage", equipment.storage || "");
      
      // Manejar periféricos - convertir array a string separado por comas
      let peripheralsValue = "";
      if (equipment.peripherals) {
        if (Array.isArray(equipment.peripherals)) {
          peripheralsValue = equipment.peripherals.join(", ");
        } else if (typeof equipment.peripherals === 'string') {
          // Si es un string que parece JSON, intentar parsearlo
          try {
            const parsed = JSON.parse(equipment.peripherals);
            if (Array.isArray(parsed)) {
              peripheralsValue = parsed.join(", ");
            } else {
              peripheralsValue = equipment.peripherals;
            }
          } catch {
            peripheralsValue = equipment.peripherals;
          }
        }
      }
      // Usar setValue con el valor como string, pero el tipo del formulario espera string[]
      setValue("peripherals", peripheralsValue as unknown as string[]);
      
      setValue("purchaseDate", equipment.purchase_date ? new Date(equipment.purchase_date).toISOString().split('T')[0] : "");
      setValue("warrantyExpiration", equipment.warranty_expiration ? new Date(equipment.warranty_expiration).toISOString().split('T')[0] : "");
      
      setValue("assignedUser", equipment.assigned_user || "");
      setValue("status", (equipment.status || 'active') as Equipment["status"]);
      setValue("incidentDescription", equipment.incident_description || "");
      
      const hasIncidents = equipment.status === "maintenance" || equipment.status === "inactive";
      setIncidents(hasIncidents);
    } catch (error) {
      console.error('Error cargando equipo:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el equipo. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: Equipment) => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Mapear datos del formulario a la estructura del backend
      const equipmentData: CreateEquipmentDto = {
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        serial_number: data.serialNumber,
        processor: data.processor,
        ram: data.ram,
        storage: data.storage,
        peripherals: (() => {
          const periph = data.peripherals as string[] | string | undefined;
          if (typeof periph === 'string') {
            return periph.split(',').map(p => p.trim()).filter(p => p);
          }
          if (Array.isArray(periph)) {
            return periph;
          }
          return [];
        })(),
        supplier_id: data.supplier ? String(data.supplier) : undefined,
        purchase_date: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : undefined,
        warranty_expiration: data.warrantyExpiration ? new Date(data.warrantyExpiration).toISOString() : undefined,
        location_id: data.location ? String(data.location) : undefined,
        assigned_user: data.assignedUser,
        status: data.status,
        created_by: user.id,
      };

      if (isEdit && id) {
        await updateEquipmentApi(id, equipmentData);
        // El backend ya crea automáticamente la entrada en el historial
        
        toast({
          title: "Equipo actualizado",
          description: "Los cambios han sido guardados correctamente.",
        });
      } else {
        await createEquipment(equipmentData);
        // El backend ya crea automáticamente la entrada en el historial
        
        toast({
          title: "Equipo agregado",
          description: "El equipo ha sido registrado correctamente.",
        });
      }

      navigate("/inventory");
    } catch (error: unknown) {
      console.error('Error guardando equipo:', error);
      const errorMessage = error instanceof Error ? error.message : "No se pudo guardar el equipo. Por favor, intenta nuevamente.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/inventory")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEdit ? "Editar Equipo" : "Agregar Equipo"}
          </h1>
          <p className="text-muted-foreground">
            {isEdit
              ? "Actualiza la información del equipo"
              : "Registra un nuevo equipo en el inventario"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>Datos principales del equipo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Equipo *</Label>
                    <Input
                      id="name"
                      placeholder="Ej: PC-OFICINA-001"
                      {...register("name", {
                        required: "El nombre es requerido",
                      })}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Equipo *</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("type", value as Equipment["type"])
                      }
                      defaultValue={watchType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Escritorio</SelectItem>
                        <SelectItem value="laptop">Portátil</SelectItem>
                        <SelectItem value="server">Servidor</SelectItem>
                        <SelectItem value="printer">Impresora</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Input
                      id="brand"
                      placeholder="Ej: Dell, HP, Lenovo"
                      {...register("brand", {
                        required: "La marca es requerida",
                      })}
                      className={errors.brand ? "border-destructive" : ""}
                    />
                    {errors.brand && (
                      <p className="text-sm text-destructive">
                        {errors.brand.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Input
                      id="model"
                      placeholder="Ej: OptiPlex 7090"
                      {...register("model", {
                        required: "El modelo es requerido",
                      })}
                      className={errors.model ? "border-destructive" : ""}
                    />
                    {errors.model && (
                      <p className="text-sm text-destructive">
                        {errors.model.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="serialNumber">Número de Serie *</Label>
                    <Input
                      id="serialNumber"
                      placeholder="Ej: SN123456789"
                      {...register("serialNumber", {
                        required: "El número de serie es requerido",
                      })}
                      className={
                        errors.serialNumber ? "border-destructive" : ""
                      }
                    />
                    {errors.serialNumber && (
                      <p className="text-sm text-destructive">
                        {errors.serialNumber.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificaciones Técnicas</CardTitle>
                <CardDescription>
                  Detalles técnicos del equipo (opcional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="processor">Procesador</Label>
                    <Input
                      id="processor"
                      placeholder="Ej: Intel i7"
                      {...register("processor")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ram">Memoria RAM</Label>
                    <Input
                      id="ram"
                      placeholder="Ej: 16GB DDR4"
                      {...register("ram")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage">Almacenamiento</Label>
                    <Input
                      id="storage"
                      placeholder="Ej: 512GB SSD"
                      {...register("storage")}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peripherals">Periféricos</Label>
                  <Controller
                    name="peripherals"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id="peripherals"
                        placeholder="Ej: Monitor Dell 24', Teclado Logitech, Mouse inalámbrico"
                        value={Array.isArray(field.value) ? field.value.join(", ") : (field.value || "")}
                        onChange={(e) => field.onChange(e.target.value)}
                        rows={3}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proveedor y Garantía</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor *</Label>
                  <Controller
                    name="supplier"
                    control={control}
                    rules={{ required: "El proveedor es requerido" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un proveedor" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={String(supplier.id)}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.supplier && (
                    <p className="text-sm text-destructive">
                      {errors.supplier.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Fecha de Adquisición *</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...register("purchaseDate", {
                      required: "La fecha es requerida",
                    })}
                    className={errors.purchaseDate ? "border-destructive" : ""}
                  />
                  {errors.purchaseDate && (
                    <p className="text-sm text-destructive">
                      {errors.purchaseDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warrantyExpiration">
                    Vencimiento de Garantía *
                  </Label>
                  <Input
                    id="warrantyExpiration"
                    type="date"
                    {...register("warrantyExpiration", {
                      required: "La fecha es requerida",
                    })}
                    className={
                      errors.warrantyExpiration ? "border-destructive" : ""
                    }
                  />
                  {errors.warrantyExpiration && (
                    <p className="text-sm text-destructive">
                      {errors.warrantyExpiration.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ubicación y Asignación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación *</Label>
                  <Controller
                    name="location"
                    control={control}
                    rules={{ required: "La ubicación es requerida" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una ubicación" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={String(location.id)}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedUser">Usuario Asignado *</Label>
                  <Input
                    id="assignedUser"
                    placeholder="Nombre del usuario"
                    {...register("assignedUser", {
                      required: "El usuario es requerido",
                    })}
                    className={errors.assignedUser ? "border-destructive" : ""}
                  />
                  {errors.assignedUser && (
                    <p className="text-sm text-destructive">
                      {errors.assignedUser.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Controller
                    name="status"
                    control={control}
                    rules={{ required: "El estado es requerido" }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          const hasIncidents = value === "maintenance" || value === "inactive";
                          setIncidents(hasIncidents);
                          if (value === "active") {
                            setValue("incidentDescription", "");
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          {
                            params.id && (<>
                            <SelectItem value="maintenance">
                              Mantenimiento
                            </SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            </>) 
                          }
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.status && (
                    <p className="text-sm text-destructive">
                      {errors.status.message}
                    </p>
                  )}
                </div>

                {/* {incidents && (
                  <div className="space-y-2">
                    <Label htmlFor="incidentDescription">Descripción del Incidente *</Label>
                    <Textarea 
                      id="incidentDescription" 
                      placeholder="Detalla el incidente ocurrido" 
                      {...register("incidentDescription", { 
                        required: incidents ? "La descripción del incidente es requerida" : false
                      })} 
                      rows={3}
                      className={errors.incidentDescription ? "border-destructive" : ""}
                    />
                    {errors.incidentDescription && (
                      <p className="text-sm text-destructive">
                        {errors.incidentDescription.message}
                      </p>
                    )}
                  </div>
                )} */}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/inventory")}
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : isEdit ? "Guardar Cambios" : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
