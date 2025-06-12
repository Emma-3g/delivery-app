import { google } from "googleapis"
import { JWT } from "google-auth-library"

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL!,
  key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  scopes: SCOPES,
})

export async function getGoogleClient() {
  const sheets = google.sheets({ version: "v4", auth })
  return sheets
}
