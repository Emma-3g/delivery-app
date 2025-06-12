"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import PendingDeliveries from "@/components/pending-deliveries"
import DeliveryHistory from "@/components/delivery-history"
import QrScanner from "@/components/qr-scanner"
import { registerDelivery, findDeliveryByOrderId } from "@/lib/actions"
import { toast } from "@/hooks/use-toast"

export default function DeliveryForm() {
  const [orderId, setOrderId] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [deliveryType, setDeliveryType] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState("")
  const [problem, setProblem] = useState("")
  const [horario, setHorario] = useState("")
  const [negocio, setNegocio] = useState("")
  const [comentario, setComentario] = useState("")
  const [telefono, setTelefono] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tab, setTab] = useState("form")

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) return
      const data = await findDeliveryByOrderId(orderId)
      if (data) {
        setCustomerEmail(data.customerEmail || "")
        setDeliveryType(data.deliveryType || "")
        setQuantity(data.quantity || 1)
        setHorario(data.horario || "")
        setNegocio(data.negocio || "")
        setComentario(data.comentario || "")
        setTelefono(data.telefono || "")
      }
    }
    fetchData()
  }, [orderId])

  const handleScan = async (scannedId: string) => {
    setOrderId(scannedId)
    const data = await findDeliveryByOrderId(scannedId)
    if (data) {
      setCustomerEmail(data.customerEmail || "")
      setDeliveryType(data.deliveryType || "")
      setQuantity(data.quantity || 1)
      setHorario(data.horario || "")
      setNegocio(data.negocio || "")
      setComentario(data.comentario || "")
      setTelefono(data.telefono || "")
    } else {
      toast({ title: "Orden no encontrada", variant: "destructive" })
    }
    setTab("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!status) {
      toast({
        title: "Seleccioná el estado de la entrega",
        variant: "destructive",
      })
      return
    }

    if (status === "problem" && !problem) {
      toast({
        title: "Seleccioná el tipo de problema",
        variant: "destructive",
      })
      return
    }

    if (status === "problem" && problem === "otro" && !comentario.trim()) {
      toast({
        title: "Describí el problema en el campo de comentario",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await registerDelivery({
        orderId,
        customerEmail,
        deliveryType,
        quantity,
        serialNumber: "",
        status,
        problem: status === "problem" ? problem : "",
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        deliveryPersonId: "demo",
        address: "",
        customerName: "",
        horario,
        negocio,
        comentario,
        telefono,
      })

      toast({
        title: "¡Entrega cargada con éxito!",
        description: `La orden ${orderId} fue registrada correctamente.`,
      })

      setOrderId("")
      setCustomerEmail("")
      setDeliveryType("")
      setQuantity(1)
      setStatus("")
      setProblem("")
      setHorario("")
      setNegocio("")
      setComentario("")
      setTelefono("")
    } catch (err) {
      toast({
        title: "Error al registrar entrega",
        description: "Verificá los campos o la conexión con Sheets",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="form">Registrar Entrega</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="qr">Escanear QR</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="orderId">ID de Orden</Label>
              <div className="flex gap-2">
                <Input id="orderId" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
                <Button type="button" onClick={async () => {
                  const data = await findDeliveryByOrderId(orderId)
                  if (data) {
                    setCustomerEmail(data.customerEmail || "")
                    setDeliveryType(data.deliveryType || "")
                    setQuantity(data.quantity || 1)
                    setHorario(data.horario || "")
                    setNegocio(data.negocio || "")
                    setComentario(data.comentario || "")
                    setTelefono(data.telefono || "")
                  } else {
                    toast({ title: "Orden no encontrada", variant: "destructive" })
                  }
                }}>
                  Buscar
                </Button>
              </div>
            </div>

            <div><Label>Email del Cliente</Label><Input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} /></div>
            <div><Label>Tipo de Entrega</Label><Input value={deliveryType} onChange={(e) => setDeliveryType(e.target.value)} /></div>
            <div><Label>Cantidad</Label><Input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min={1} /></div>
            <div><Label>Horario</Label><Input value={horario} onChange={(e) => setHorario(e.target.value)} /></div>
            <div><Label>Negocio</Label><Input value={negocio} onChange={(e) => setNegocio(e.target.value)} /></div>
            <div><Label>Comentario</Label><Input value={comentario} onChange={(e) => setComentario(e.target.value)} /></div>
            <div><Label>Teléfono</Label><Input value={telefono} onChange={(e) => setTelefono(e.target.value)} /></div>

            <div>
              <Label>Estado de la Entrega</Label>
              <RadioGroup value={status} onValueChange={setStatus} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivered" id="delivered" />
                  <Label htmlFor="delivered" className="flex items-center gap-2 cursor-pointer">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Entrega Confirmada
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="problem" id="problem" />
                  <Label htmlFor="problem" className="flex items-center gap-2 cursor-pointer">
                    <AlertCircle className="h-4 w-4 text-red-500" /> Problema en la Entrega
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {status === "problem" && (
              <div className="space-y-2">
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
                </div>

                {problem === "otro" && (
                  <div>
                    <Label>Comentario</Label>
                    <Input value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Describí el problema" />
                  </div>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Registrar Entrega"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <PendingDeliveries />
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <DeliveryHistory />
        </TabsContent>

        <TabsContent value="qr" className="mt-4">
          <h4 className="text-lg font-medium mb-2">📷 Escanear código QR</h4>
          <QrScanner onScan={handleScan} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
