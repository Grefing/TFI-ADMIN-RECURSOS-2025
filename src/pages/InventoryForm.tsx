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
import { addEquipment, updateEquipment, getEquipment } from "@/utils/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEdit, setIsEdit] = useState(false);

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
    if (id) {
      setIsEdit(true);
      const equipment = getEquipment().find((e) => e.id === id);
      if (equipment) {
        Object.keys(equipment).forEach((key) => {
          setValue(key as keyof Equipment, equipment[key as keyof Equipment]);
        });
      }
    }
  }, [id, setValue]);

  const onSubmit = (data: Equipment) => {
    if (!user) return;

    const equipmentData: Equipment = {
      ...data,
      id: id || crypto.randomUUID(),
      peripherals: data.peripherals || [],
      updatedAt: new Date().toISOString(),
      createdAt: isEdit ? data.createdAt : new Date().toISOString(),
    };

    if (isEdit) {
      updateEquipment(equipmentData.id, equipmentData, user.username);
      toast({
        title: "Equipo actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    } else {
      addEquipment(equipmentData, user.username);
      toast({
        title: "Equipo agregado",
        description: "El equipo ha sido registrado correctamente.",
      });
    }

    navigate("/inventory");
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
                  <Textarea
                    id="peripherals"
                    placeholder="Ej: Monitor Dell 24', Teclado Logitech, Mouse inalámbrico"
                    {...register("peripherals")}
                    rows={3}
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
                  <Input
                    id="supplier"
                    placeholder="Nombre del proveedor"
                    {...register("supplier", {
                      required: "El proveedor es requerido",
                    })}
                    className={errors.supplier ? "border-destructive" : ""}
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
                  <Input
                    id="location"
                    placeholder="Ej: Oficina Principal - Piso 2"
                    {...register("location", {
                      required: "La ubicación es requerida",
                    })}
                    className={errors.location ? "border-destructive" : ""}
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
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="maintenance">
                            Mantenimiento
                          </SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
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
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {isEdit ? "Guardar Cambios" : "Registrar"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default InventoryForm;
