import { NextRequest, NextResponse } from 'next/server';
import nodemailer, { TransportOptions } from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, last_name, first_name } = await request.json();

    // Create a transporter object using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `Pentagon Maritime Services Corp. <${process.env.EMAIL}>`,
      to: `${last_name}, ${first_name} <${to}>`,
      subject,
      text,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pentagon Maritime Services Corp.</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f3f4f6;
            font-family: Arial, sans-serif;
        }
        .outer-container {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #D9D9D9;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .container {
            width: 90%;
            max-width: 600px;
            background: white;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #1C437E;
            padding: 10px;
            color: white;
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
        }
        .intro p {
            font-weight: bold;
        }
        .content {
            font-size: 12px;
            margin: 10px 0;
        }
        .disclaimer {
            border-top: 1px solid #1C437E;
            border-bottom: 1px solid #1C437E;
            padding: 10px;
            font-size: 9px;
            font-style: italic;
            text-align: center;
        }
    </style>
</head>
<body>
    <div className="outer-container">
        <div class="container">
            <div class="header">Pentagon Maritime Services Corp.</div>
            <div class="intro">
                <p>Hi ${first_name} ${last_name},</p>
            </div>
            <div class="content">
                <p>Thank you for submitting your information at Pentagon Maritime Services Corp. We'll get started reviewing your submitted information and keep you informed about your training details.</p>
                <p>Meanwhile, check out what we're up to by following our facebook account: <a href="https://www.facebook.com/Pentagonmaritimeservicescorp?mibextid=JRoKGi">Pentagon Maritime Services Corp.</a></p>
                <p>We'll be in touch with you soon.</p>
                <p>Pentagon Registration Team</p>
            </div>
            <div class="disclaimer">
                <p>Pentagon Maritime is committed to keeping your personal data secure and processing it in accordance with applicable data protection laws.</p>
            </div>
        </div>
    </div>
</body>
</html>
`});

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}