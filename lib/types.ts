export type DeliveryType =
  | "rollos_papel"
  | "terminal_point_venta"
  | "terminal_point_delivery"
  | "terminal_point_recambio"
  | "otro"

export type DeliveryStatus = "pending" | "delivered" | "problem"

export type DeliveryProblem =
  | "destinatario_ausente"
  | "direccion_incorrecta"
  | "paquete_dañado"
  | "rechazo_cliente"
  | "otro"

export type DeliveryPriority = "normal" | "alta" | "urgente"

export interface Delivery {
  id: string
  orderId: string
  customerEmail?: string
  deliveryType: DeliveryType
  quantity: number
  serialNumber?: string
  status: DeliveryStatus
  problem?: DeliveryProblem
  timestamp: string
  createdAt: string
  deliveryPersonId: string
  priority?: DeliveryPriority
  customerName?: string
  address?: string
  telefono?: string
  horario?: string
  negocio?: string
  comentario?: string
}

export function getDaysSinceCreation(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const now = new Date().getTime()
  return Math.floor((now - created) / (1000 * 60 * 60 * 24))
}

export function getPriorityFromDays(days: number): DeliveryPriority {
  if (days >= 5) return "urgente"
  if (days >= 3) return "alta"
  return "normal"
}

