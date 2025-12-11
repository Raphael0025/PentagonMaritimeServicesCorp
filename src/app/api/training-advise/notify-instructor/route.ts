import { NextRequest, NextResponse } from "next/server"
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest){
    try{
        const { 
            to, 
            course_code, 
            course_name, 
            time_duration, 
            presentation_link,
            trainees,
            note1,
            schedule,
            instructor,
            class_code,
            gmeet_code,
            gmeet_link,
            staff, 
            position 
        } = await request.json()
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        })

        const listOfTrainees = trainees.map((trainee: string) => `<li>${trainee}</li>`).join('');
        const currentYear = new Date().getFullYear()

        await transporter.sendMail({
            from: `Pentagon Maritime Services Corp. <${process.env.EMAIL}>`,
            to,
            subject: `PENTAGON'S ${course_code} TRAINING - ${schedule.toUpperCase()}, ${currentYear}`,
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
                                <p>Good Day ${instructor}!</p>
                                <div class="section">
                                    <p><strong>TRAINING DETAILS</strong></p>
                                    <p><strong>Date:</strong> ${schedule.toUpperCase()}, ${currentYear}</p>
                                    <p><strong>Time:</strong> ${time_duration}</p>
                                    <p><strong>Mode of Training:</strong> Online</p>
                                </div>
                                <div class="section">
                                    <p>The intended training will be carried out as follows:</p>
                                    ${note1}
                                    <p>Indicated below are the codes that you can use for the training tomorrow.</p>
                                </div>
                                <div>
                                    <p><strong>For Google Classroom Code:</strong> ${class_code}</p>
                                    <p>For Google Meet:</p>
                                    <ul>
                                        <li><strong>Meet Code:</strong> ${gmeet_code}</li>
                                        <li>If you want direct access to the meet. Kindly click the link below.</li>
                                        <li><strong>Meet Link:</strong> <a href="${gmeet_link}" target="_blank" >Click here</a></li>
                                    </ul>
                                    <p>I've already sent you a class invitation to your email, if you did not receive it we are happy to resend it to you upon request.</p>
                                </div>
                                <div class="section">
                                    <p><strong>Reminders:</strong></p>
                                    <p>Please remind the Pentagon Staff to give the final instructions to the trainees before concluding the training session. Please also be informed that your training activities are being monitored, so kindly utilize the full allotted time unless we advise otherwise. If you have already completed your course presentation, we would appreciate it if you could show relevant training videos to the trainees for the remaining duration of the session.</p>
                                </div>
                                <p>Below is the list of trainees for the ${course_code} class at ${time_duration}</p>
                                <div class="section">
                                    <p><strong>COURSE PRESENTATION LINK:</strong></p>
                                    <p>Below here is the presentation link for you to be able to view with ease:</p>
                                    <a href="${presentation_link}" target="_blank">Click here to view</a>
                                </div>
                                <div class="section">
                                    <p> <strong>LIST OF TRAINEES</strong></p>
                                    <ol>
                                        ${listOfTrainees.toUpperCase()}
                                    </ol>
                                </div>
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
                                    Phone: 0960 525 0028 (Training Dept.) | 0977 356 8035 (Registration Dept.)<br>
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
        return NextResponse.json({ message: 'Training advise sent successfully' })  
    } catch(error){
        return NextResponse.json({ error: 'Failed to send training advise'})
    }
}