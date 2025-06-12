"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import {
  getPendingDeliveries,
  updateDeliveryStatus
} from "@/lib/actions"
import {
  type Delivery, type DeliveryStatus, type DeliveryProblem,
  getDaysSinceCreation
} from "@/lib/types"
import { toast } from "@/hooks/use-toast"
import { MapPin, Clock, Mail, Phone } from "lucide-react"

export default function PendingDeliveries() {
  const [pendingDeliveries, setPendingDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [status, setStatus] = useState<DeliveryStatus>("delivered")
  const [problem, setProblem] = useState<DeliveryProblem | "">("")
  const [comentario, setComentario] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    loadPendingDeliveries()
  }, [])

  const loadPendingDeliveries = async () => {
    setLoading(true)
    try {
      const deliveries = await getPendingDeliveries()
      setPendingDeliveries(deliveries)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las entregas pendientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedDelivery) return
    if (status === "problem" && !problem) {
      toast({
        title: "Seleccioná el tipo de problema",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const success = await updateDeliveryStatus(
        selectedDelivery.orderId,
        status,
        status === "problem" ? problem : undefined,
        comentario || ""
      )
      if (success) {
        toast({ title: "Estado actualizado" })
        setDialogOpen(false)
        loadPendingDeliveries()
      } else {
        throw new Error()
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityBadge = (delivery: Delivery) => {
    const days = getDaysSinceCreation(delivery.createdAt)
    if (days >= 5) {
      return <Badge variant="destructive"><Clock className="h-3 w-3" /> Urgente ({days} días)</Badge>
    } else if (days >= 3) {
      return <Badge className="bg-orange-500"><Clock className="h-3 w-3" /> Alta ({days} días)</Badge>
    } else {
      return <Badge variant="outline"><Clock className="h-3 w-3" /> {days} días</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (pendingDeliveries.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p>No hay entregas pendientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Entregas Pendientes</h2>
        <Button variant="outline" size="sm" onClick={loadPendingDeliveries}>Actualizar</Button>
      </div>

      {pendingDeliveries.map((delivery) => (
        <Card key={delivery.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-base">Orden: {delivery.orderId}</CardTitle>
              {getPriorityBadge(delivery)}
            </div>
          </CardHeader>
          <CardContent className="pb-4 space-y-2 text-sm">
            <div><b>Tipo:</b> {delivery.deliveryType} | <b>Cantidad:</b> {delivery.quantity}</div>
            {delivery.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.address}</span>
              </div>
            )}
            {delivery.customerEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.customerEmail}</span>
              </div>
            )}
            {delivery.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{delivery.telefono}</span>
              </div>
            )}
            {delivery.horario && <div><b>Horario:</b> {delivery.horario}</div>}
            {delivery.negocio && <div><b>Negocio:</b> {delivery.negocio}</div>}
            {delivery.comentario && <div><b>Comentario:</b> {delivery.comentario}</div>}

            <Dialog open={dialogOpen && selectedDelivery?.id === delivery.id} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    setSelectedDelivery(delivery)
                    setStatus("delivered")
                    setProblem("")
                    setComentario("")
                  }}
                >
                  Actualizar Estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Actualizar Estado</DialogTitle>
                  <DialogDescription>Orden: {delivery.orderId}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <RadioGroup value={status} onValueChange={setStatus}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivered" id="delivered" />
                      <Label htmlFor="delivered">Entrega Confirmada</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="problem" id="problem" />
                      <Label htmlFor="problem">Problema en la Entrega</Label>
                    </div>
                  </RadioGroup>
                  {status === "problem" && (
                    <div>
                      <Label>Tipo de Problema</Label>
                      <Select value={problem} onValueChange={setProblem}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná el tipo de problema" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="destinatario_ausente">Destinatario Ausente</SelectItem>
                          <SelectItem value="direccion_incorrecta">Dirección Incorrecta</SelectItem>
                          <SelectItem value="paquete_dañado">Paquete Dañado</SelectItem>
                          <SelectItem value="rechazo_cliente">Rechazo del Cliente</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      {problem === "otro" && (
                        <div className="mt-2">
                          <Label>Comentario</Label>
                          <Textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Describí el problema"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleUpdateStatus} disabled={isSubmitting}>
                    {isSubmitting ? "Actualizando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}


