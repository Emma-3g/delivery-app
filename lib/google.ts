import { google } from "googleapis"

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
]

const auth = new google.auth.GoogleAuth({
  scopes: SCOPES,
})

export function getAuth() {
  return auth
}

export default google
