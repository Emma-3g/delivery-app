import { google } from "googleapis"
import { getAuth } from "./google"
import type { Delivery, DeliveryStatus } from "./types"

const SHEET_ID = "1Emx1R2q8qIg5N4DTuF8V18MIoUtRcYe8QKdzpzRZshI"
const SHEET_NAME = "Hoja1"
const RANGE = `${SHEET_NAME}!A2:AD`

function mapRowToDelivery(row: string[], index: number): Delivery {
  return {
    id: `row_${index + 2}`,
    orderId: row[1] || "",
    customerEmail: row[2] || "",
    deliveryType: row[3] || "",
    quantity: parseInt(row[4] || "1"),
    serialNumber: row[5] || "",
    status: row[6] as DeliveryStatus,
    problem: row[7] || "",
    timestamp: row[8] || "",
    createdAt: row[9] || "",
    deliveryPersonId: row[10] || "",
    address: row[11] || "",
    telefono: row[19] || "",
    horario: row[23] || "",
    negocio: row[24] || "",
    comentario: row[28] || "",
  }
}

export async function getPendingDeliveries(): Promise<Delivery[]> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  return rows
    .map((row, i) => mapRowToDelivery(row, i))
    .filter((d) => d.status === "pending")
}

export async function getDeliveryHistory(): Promise<Delivery[]> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  return rows
    .map((row, i) => mapRowToDelivery(row, i))
    .filter((d) => d.status !== "pending")
}

export async function findDeliveryByOrderId(orderId: string): Promise<Delivery | null> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  const index = rows.findIndex((r) => r[1] === orderId)
  if (index === -1) return null

  return mapRowToDelivery(rows[index], index)
}

export async function updateDeliveryStatus(
  orderId: string,
  status: DeliveryStatus,
  problem?: string,
  comentario?: string
): Promise<boolean> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  })

  const rows = res.data.values || []
  const index = rows.findIndex((r) => r[1] === orderId)
  if (index === -1) return false

  const timestamp = new Date().toISOString()

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!G${index + 2}:I${index + 2}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, problem || "", timestamp]],
    },
  })

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!AC${index + 2}`, // columna 29 = comentario
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[comentario || ""]],
    },
  })

  return true
}

export async function addDeliveryToSheet(data: Omit<Delivery, "id">): Promise<Delivery> {
  const auth = await getAuth()
  const sheets = google.sheets({ version: "v4", auth })

  const getResp = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!B2:B`,
  })

  const ordenesExistentes = getResp.data.values?.flat() || []
  if (ordenesExistentes.includes(data.orderId)) {
    throw new Error(`Ya existe una entrega con orderId: ${data.orderId}`)
  }

  const newRow = [
    data.status,
    data.orderId,
    data.customerEmail || "",
    data.deliveryType,
    data.quantity.toString(),
    data.serialNumber || "",
    data.status,
    data.problem || "",
    new Date().toISOString(),
    data.createdAt || new Date().toISOString(),
    data.deliveryPersonId,
    data.address || "",
    data.deliveryPersonId,
    "", // programa
    "", // canal
    data.customerEmail || "",
    data.createdAt?.slice(0, 10) || "",
    "", // despacho
    "", // localidad
    data.telefono || "",
    data.deliveryType,
    "", "", // serieEntregado, serieRetirado
    data.horario || "",
    data.negocio || "",
    "", // entregado
    "", // canal_duplicado
    "", // cordon
    data.comentario || "",
  ]

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRow],
    },
  })

  return {
    ...data,
    id: `del_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  }
}


