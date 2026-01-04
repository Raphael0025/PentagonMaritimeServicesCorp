import { NextRequest, NextResponse } from "next/server"
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest){
    try{
        const { 
            bcc, 
            course_code, 
            course_name, 
            schedule, 
            actual_sched,
            time, 
            class_code, 
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
        const currentYear = new Date().getFullYear()

        await transporter.sendMail({
            from: `Pentagon Maritime Services Corp. <${process.env.EMAIL}>`,
            to: `undisclosed-recipients:;`,
            bcc: bcc,
            subject: `${course_code.toUpperCase()} TRAINING (${schedule.toUpperCase()})`,
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
                                    <p><strong>TRAINING:</strong> ${course_name.toUpperCase()} (${course_code.toUpperCase()})<br>
                                    <strong>When:</strong><br>
                                    Certificate Date: ${schedule}<br>
                                    Training date and time: ${actual_sched}, ${currentYear} - ${time} (PH Time)<br>
                                    Where: Google Classroom (Online Modular)<br>
                                    Classroom code: <strong>${class_code}</strong></p>
                                </div>
                                <div class="section">
                                    <p><strong>Important: <i></i>YOU DO NOT NEED TO JOIN GOOGLE MEET.</i></strong> Please access and complete the materials in Google Classroom.<br>
                                    <p><strong>How to join Google Classroom:</strong></p>
                                    <ul>
                                        <li><strong>Mobile users:</strong> <a href='https://drive.google.com/file/d/1kjBjrzcpow5dFQ5LtWPAgFz1Rf5nuScF/view?usp=drive_link' target='_blank' >Click here</a></li>
                                        <li><strong>Desktop / Laptop:</strong> <a href='https://drive.google.com/file/d/1S7AL-StCH3q_-qPoe2DbQbnDbaE0qRei/view?usp=drive_link' target='_blank' >Click here</a></li>
                                    </ul>
                                </div>
                                <div class="section">
                                    <p><strong>Required:</strong></p>
                                    <ul>
                                        <li>Fill out the attendance form before the training starts <strong>(inside the classwork tab)</strong>.</li>
                                        <li>Read the presentation <strong>(inside the classwork tab)</strong>.</li>
                                        <li>Answer the written assessment after the training <strong>(inside the classwork tab)</strong>.</li>
                                        <li>Answer the feedback form after the training <strong>(inside the classwork tab)</strong>.</li>
                                    </ul>
                                </div>
                                <div class="section">
                                    <p><strong>How to access forms (inside Classwork)</strong></p>
                                    <ul>
                                        <li><strong>Mobile users:</strong> <a href='https://drive.google.com/file/d/1zoaxpIqwX477T4fKpVYXFYnd1vmdPnZl/view' target='_blank' >Click here</a></li>
                                        <li><strong>Desktop / Laptop:</strong> <a href='https://drive.google.com/file/d/1MdVZt6RV0M0AEvvB86c0yNRH3haHKrJb/view' target='_blank' >Click here</a></li>
                                    </ul>
                                </div>
                                <p>For further training concerns, please contact this number: <strong>0918 598 8553</strong></p>
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