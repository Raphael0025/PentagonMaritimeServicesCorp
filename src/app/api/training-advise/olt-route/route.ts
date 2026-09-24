import { NextRequest, NextResponse } from "next/server"
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest){
    try{
        const { 
            bcc, 
            course_code, 
            course_name, 
            schedule, 
            time, 
            gClassLink, // gClassLink,
            gmeetLink,
            staff, 
            position 
        } = await request.json()
        const recipientArray: string[] = Array.isArray(bcc) ? bcc : [bcc];
        const transporter = nodemailer.createTransport({
            // service: 'gmail',
            // auth: {
            //     user: process.env.EMAIL,
            //     pass: process.env.EMAIL_PASS,
            // },
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: Number(process.env.SMTP_PORT) || 465,
            secure: process.env.SMTP_SECURE === 'true' || true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },  
        })
        const currentYear = new Date().getFullYear()

        const info = await transporter.sendMail({
            from: `Pentagon Maritime Training Dept. <${process.env.EMAIL}>`,
            to: `undisclosed-recipients:;`,
            bcc: recipientArray,
            subject: `${course_code.toUpperCase()} TRAINING (${schedule.toUpperCase()}, ${currentYear})`,
            html:  `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8" />
                        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                        <style>
                            body {
                                margin: 0;
                                font-family: Arial, sans-serif;
                                background-color: #d9d9d9;
                            }
                            
                            .email-wrapper {
                                max-width: 800px;
                                margin: 0 auto;
                                background: #fff;
                                box-shadow: 0 0 5px rgba(0,0,0,0.1);
                            }
                            
                            .email-header {
                                text-align: center;
                                background-color: #1C437E;
                                color: white;
                                padding: 20px;
                                border-radius: 8px 8px 0 0;
                            }
                            
                            .email-header .logo {
                                margin-bottom: 10px;
                            }
                            .logo{
                                width: 250px;
                            }
                            .email-header h1 {
                                font-size: 1.8rem;
                                margin: 10px 0 5px;
                            }
                            
                            .email-header h1 span {
                                font-weight: normal;
                                font-size: 1rem;
                            }
                            
                            .subhead {
                                font-size: 0.95rem;
                                margin-top: 10px;
                                color: red;
                            }
                            
                            .email-body {
                                padding: 20px;
                                font-size: 0.95rem;
                                background-color: #d9d9d9;
                                width: 100px;
                            }
                            
                            .section {
                                margin: 20px 0;
                            }
                            
                            .section ul, .section ol {
                                margin: 10px 0 10px 20px;
                            }
                            
                            .section li {
                                margin-bottom: 5px;
                            }
                            
                            .disclaimer {
                                font-size: 0.7rem;
                                font-style: italic;
                                text-align: center;
                                margin-top: 20px;
                                padding: 10px 15px;
                                border-top: 1px solid #ccc;
                                border-bottom: 1px solid #ccc;
                            }
                            .email-footer {
                                text-align: center;
                                background-color: #1C437E;
                                color: white;
                                font-size: 0.8rem;
                                padding: 10px;
                                border-radius: 0 0 8px 8px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-wrapper">
                            <header class="email-header">
                                <img src="https://i.imgur.com/aYyVE1x.png" alt="Pentagon Logo" class="logo" />
                            </header>
                            <main class="email-body">
                                <p class="subhead"><strong>PLEASE READ THIS MESSAGE IN FULL. IT CONTAINS IMPORTANT DETAILS FOR YOUR UPCOMING TRAINING.</strong></p>
                                <div class="section">
                                    <p><strong>TRAINING DETAILS:</strong><br>
                                    Training Course: ${course_name.toUpperCase()} (${course_code.toUpperCase()})<br>
                                    Date & Time: ${schedule} - ${time} (PH Time)<br>
                                    Apps to download: Google Classroom and Google Meet<br>
                                    Google Classroom link: <a href="${gClassLink}" target="_blank">${gClassLink}</a></p>
                                    Google Meet link: <a href="${gmeetLink}" target="_blank">${gmeetLink}</a></p>
                                </div>
                                <div class="section">
                                    <p><strong>Important: <i></i>YOU NEED TO JOIN BOTH GOOGLE CLASSROOM AND GOOGLEMEET.</i></strong><br>
                                    <p>PLEASE JOIN AT LEAST 10 MINUTES BEFORE THE TRAINING STARTS</p>
                                </div>
                                <p>For further training concerns, please contact this number: <strong>0945 325 7161</strong></p>
                                <p><strong>Thank you!</strong></p>
                                <div style={{ lineHeight: "1.2" }}>
                                    <p style={{ color: "#D3D3D3" }}>
                                        <strong>${staff}</strong> | <em style={{ color: "#D3D3D3", font-size: 5px }}>${position}</em>
                                    </p>
                                </div>
                                <div>
                                    <p><strong>Pentagon Maritime Services Corp.</strong></p>  
                                    <p>
                                    Address: 2/F 801 Building United Nations Ave. Ermita Manila<br>
                                    Landline: (02) 8 281-8155<br>
                                    Phone: 0918 598 8553 (Training Dept.) | 0977 356 8035 (Registration Dept.)<br>
                                    Email: pentagonmaritimeservices@gmail.com | pentagonmaritimecorp@gmail.com<br>
                                    FB: /pentagonmaritimeservicescorp
                                    </p>
                                </div>
                                <div class="disclaimer">
                                    <p>This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error, please notify the system manager. This message contains confidential information and is intended only for the individual named. If you are not the named addressee, you should not disseminate, distribute or copy this email. Please notify the sender immediately by email if you have received this email by mistake and delete this email from your system. If you are not the intended recipient, you are notified that disclosing, copying, distributing or taking any action in reliance on the contents of this information is strictly prohibited.</p>
                                </div>
                            </main>
                            <footer class="email-footer">
                                <p>&copy; 2025 by Pentagon Maritime Services Corp. All Rights Reserved</p>
                            </footer>
                        </div>
                    </body>
                    </html>
                `,
        })
        const rejectedSet = new Set(info.rejected || []);
        
        const successfulEmails = recipientArray.filter(email => !rejectedSet.has(email));
        
        return NextResponse.json({
            success: true,
            messageId: info.messageId,
            successfulEmails,
        });

    } catch (error: any) {
        console.error('Email dispatch error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}