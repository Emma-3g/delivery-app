"use server"

import { Delivery, DeliveryStatus, getDaysSinceCreation, getPriorityFromDays } from "@/lib/types"
import {
  getPendingDeliveries as getFromSheet,
  getDeliveryHistory as getHistoryFromSheet,
  addDeliveryToSheet,
  updateDeliveryStatus as updateStatusInSheet,
  findDeliveryByOrderId as findFromSheet,
} from "@/lib/sheets"

export async function registerDelivery(data: Omit<Delivery, "id">): Promise<Delivery> {
  const existing = await findFromSheet(data.orderId)

  if (existing) {
    await updateStatusInSheet(data.orderId, data.status, data.problem, data.comentario)
    return { ...existing, ...data, id: existing.id }
  }

  return await addDeliveryToSheet(data)
}

export async function getPendingDeliveries(): Promise<Delivery[]> {
  return await getFromSheet()
}

export async function getDeliveryHistory(): Promise<Delivery[]> {
  return await getHistoryFromSheet()
}

export async function updateDeliveryStatus(
  orderId: string,
  status: DeliveryStatus,
  problem?: string,
  comentario?: string
): Promise<boolean> {
  return await updateStatusInSheet(orderId, status, problem, comentario)
}

export async function findDeliveryByOrderId(orderId: string) {
  return await findFromSheet(orderId)
}
