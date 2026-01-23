import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import sanitizeHtml from 'sanitize-html'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()

        const subject = formData.get('subject') as string
        const to = formData.get('to') as string
        const bodyHtmlRaw = formData.get('bodyHtml') as string
        const files = formData.getAll('attachments') as File[]

        const cleanHtml = sanitizeHtml(bodyHtmlRaw, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                'a', 'img', 'h1', 'h2', 'h3'
            ]),
            allowedAttributes: {
                '*': ['style'],
                a: ['href', 'target', 'rel'],
                img: ['src']
            }
        })

        const attachments = await Promise.all(
            files.map(async (file) => ({
                filename: file.name,
                content: Buffer.from(await file.arrayBuffer()),
                contentType: file.type
            }))
        )

        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
        })

        await transporter.sendMail({
            from: `Pentagon Maritime Services Corp. <${process.env.EMAIL}>`,
            to,
            subject,
            html: `
                <html>
                <body>
                    <div style="font-family: Arial">
                    ${cleanHtml}
                    </div>
                </body>
                </html>
            `,
            attachments
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}