import { NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const auth = new google.auth.OAuth2()
  auth.setCredentials({ access_token: session.accessToken })

  const gmail = google.gmail({ version: "v1", auth })

  // Fetch inbox emails
  const list = await gmail.users.messages.list({
    userId: "me",
    labelIds: ["INBOX"],
    maxResults: 20,
  })

  const messages = await Promise.all(
    (list.data.messages || []).map(async (msg) => {
      const full = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      })

      const headers = full.data.payload?.headers || []
      const get = (name: string) =>
        headers.find((h) => h.name === name)?.value || ""

      return {
        id: msg.id,
        from: get("From"),
        subject: get("Subject"),
        date: get("Date"),
      }
    })
  )

  return NextResponse.json(messages)
}
