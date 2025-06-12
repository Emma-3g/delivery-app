"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { getDeliveryHistory, updateDeliveryStatus } from "@/lib/actions"
import type { Delivery } from "@/lib/types"
import { toast } from "@/hooks/use-toast"

export default function DeliveryHistory() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [status, setStatus] = useState("")
  const [problem, setProblem] = useState("")
  const [comentario, setComentario] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await getDeliveryHistory()
        setDeliveries(history)
      } catch (error) {
        console.error("Error loading delivery history:", error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDeliveryTypeLabel = (type: string) => {
    switch (type) {
      case "rollos_papel": return "Rollos de Papel"
      case "terminal_point_venta": return "Terminal Point Venta"
      case "terminal_point_delivery": return "Terminal Point Delivery"
      case "terminal_point_recambio": return "Terminal Point Recambio"
      default: return type
    }
  }

  const handleEdit = (delivery: Delivery) => {
    setEditingId(delivery.orderId)
    setStatus(delivery.status)
    setProblem(delivery.problem || "")
    setComentario(delivery.comentario || "")
  }

  const handleSave = async (orderId: string) => {
    if (!status) {
      toast({ title: "Seleccioná el estado", variant: "destructive" })
      return
    }
    if (status === "problem" && !problem) {
      toast({ title: "Seleccioná el tipo de problema", variant: "destructive" })
      return
    }
    if (status === "problem" && problem === "otro" && !comentario.trim()) {
      toast({ title: "Describí el problema", variant: "destructive" })
      return
    }

    const success = await updateDeliveryStatus(orderId, status, problem || undefined, comentario || "")
    if (success) {
      toast({ title: "Estado actualizado correctamente" })
      setEditingId(null)
      const updated = deliveries.map((d) =>
        d.orderId === orderId ? { ...d, status, problem, comentario } : d
      )
      setDeliveries(updated)
    } else {
      toast({ title: "Error al actualizar", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p>No hay entregas registradas</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Entregas Recientes</h2>

      {deliveries.map((delivery) => {
        const isEditing = editingId === delivery.orderId

        return (
          <Card key={delivery.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">Orden: {delivery.orderId}</CardTitle>
                <Badge variant={delivery.status === "delivered" ? "default" : "destructive"}>
                  {delivery.status === "delivered" ? "Entregado" : "Problema"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{formatDate(delivery.timestamp)}</p>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Tipo:</strong> {getDeliveryTypeLabel(delivery.deliveryType)}</div>
              <div><strong>Cantidad:</strong> {delivery.quantity}</div>
              {delivery.negocio && <div><strong>Negocio:</strong> {delivery.negocio}</div>}
              {delivery.horario && <div><strong>Horario:</strong> {delivery.horario}</div>}
              {delivery.telefono && <div><strong>Teléfono:</strong> {delivery.telefono}</div>}
              {delivery.customerEmail && <div><strong>Mail:</strong> {delivery.customerEmail}</div>}
              {delivery.address && <div className="col-span-2"><strong>Dirección:</strong> {delivery.address}</div>}
              {delivery.programa && <div><strong>Programa:</strong> {delivery.programa}</div>}
              {delivery.canal && <div><strong>Canal:</strong> {delivery.canal}</div>}
              {delivery.cordon && <div><strong>Cordón:</strong> {delivery.cordon}</div>}
              {delivery.serialNumber && <div><strong>Serie Entregado:</strong> {delivery.serialNumber}</div>}
              {delivery.serieRetirado && <div><strong>Serie Retirado:</strong> {delivery.serieRetirado}</div>}
              {delivery.deliveryPersonId && <div><strong>Operador:</strong> {delivery.deliveryPersonId}</div>}
              {delivery.comentario && <div className="col-span-2"><strong>Comentario:</strong> {delivery.comentario}</div>}
              {delivery.problem && <div className="col-span-2 text-red-500 flex items-center gap-2"><AlertCircle className="h-4 w-4" />{delivery.problem.replace(/_/g, " ")}</div>}

              <div className="col-span-2 pt-2">
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={() => handleEdit(delivery)}>Editar Estado</Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Estado de la Entrega</Label>
                      <RadioGroup value={status} onValueChange={setStatus} className="mt-1">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivered" id={`delivered-${delivery.id}`} />
                          <Label htmlFor={`delivered-${delivery.id}`}>Entrega Confirmada</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="problem" id={`problem-${delivery.id}`} />
                          <Label htmlFor={`problem-${delivery.id}`}>Problema en la Entrega</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {status === "problem" && (
                      <div>
                        <Label>Tipo de Problema</Label>
                        <Select value={problem} onValueChange={setProblem}>
                          <SelectTrigger><SelectValue placeholder="Seleccioná tipo de problema" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="destinatario_ausente">Destinatario Ausente</SelectItem>
                            <SelectItem value="direccion_incorrecta">Dirección Incorrecta</SelectItem>
                            <SelectItem value="paquete_dañado">Paquete Dañado</SelectItem>
                            <SelectItem value="rechazo_cliente">Rechazo del Cliente</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {status === "problem" && problem === "otro" && (
                      <div>
                        <Label>Comentario</Label>
                        <Input value={comentario} onChange={(e) => setComentario(e.target.value)} />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="default" size="sm" onClick={() => handleSave(delivery.orderId)}>Guardar</Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
