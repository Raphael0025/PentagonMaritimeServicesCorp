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
            training_mode, 
            class_code, 
            tro_contact, 
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
            subject: `${course_code} TRAINING (${schedule.toUpperCase()}, ${currentYear})`,
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
                                <h1>${course_name} TRAINING</h1>
                                <p class="subhead"><strong>Please read the entire email carefully and thoroughly, ensuring you review all content up to the final content.</strong></p>
                                <p><strong>Greetings!</strong></p>
                                <p>I'm reaching out to share the details for today’s training session. Below, you’ll find all the essential information. Please don’t hesitate to get in touch if you have any questions or need additional details.<br>Looking forward to the session!</p>
                                <div class="section">
                                    <p><strong>TRAINING DETAILS:</strong><br>
                                    Course: ${course_name} (${course_code})<br>
                                    Training Date: ${schedule}, ${currentYear}<br>
                                    Time: ${time} (PH Time)<br>
                                    Mode of Training: ${training_mode}</p>
                                </div>
                                <div class="section">
                                    <p><strong>Platforms Need to Download:</strong> Google Classroom and Google Meet<br>
                                    <p><strong>Note:</strong></p>
                                    <ul>
                                        <li>If you are <strong>using a mobile phone,</strong> you have to download it from <strong>the Play Store or the App Store</strong></li>
                                        <li>If you are <strong>using a desktop or laptop, open Google Chrome,</strong> then click the <strong>nine-dot grid icon</strong> beside your <strong>Google profile,</strong> located at the <strong>upper right corner,</strong> and scroll down to find it.</li>
                                    </ul>
                                    <strong>Google Classroom Code:</strong> ${class_code}</p>
                                </div>
                                <div class="section">
                                    <p><strong>TRAINING INSTRUCTIONS/REMINDERS:</strong></p>
                                    <p><em>For Google Classroom (before the class starts):</em></p>
                                    <ol>
                                        <li>After downloading Google Classroom, click the plus (+) button to join the class using the Google Classroom code indicated above.
                                            <ul>
                                                <li>For phone users, the plus (+) button can be found at the lower right corner</li>
                                                <li>For desktop/laptop users, the plus (+) button can be found at the upper right corner</li>
                                            </ul>
                                        </li>
                                        <li>Next, go to the classwork.
                                            <ul>
                                                <li>For phone users, classwork can be found at the center bottom</li>
                                                <li>For desktop/laptop users, classwork can be found at the center top</li>
                                            </ul>
                                        </li>
                                        <li>Then, click the attendance list under the bulletin board category and fill out the attendance form (Google Forms).</li>
                                        <li>After completing the attendance form, you can start reading the course presentation.</li>
                                        <li>Once you have completed reading the <strong>course presentation,</strong> kindly proceed to <strong>answer the assessment.</strong></li>
                                        <li>Upon completing the assessment, kindly proceed to answer the <strong>post-training satisfaction survey</strong> found under the <strong></strong>feedback form</strong> category.</li>
                                    </ol>
                                    <p>Upon completing your training, please message the number below that your training for the day has been completed.</p>
                                    <p>For further training concerns, please contact this number: ${tro_contact}</p>
                                </div>
                                <p><strong>Thank you!</strong></p>
                                <div style={{ lineHeight: "1.2" }}>
                                    <p style={{ color: "#D3D3D3" }}><strong>${staff}</strong><br />
                                    <em style={{ color: "#D3D3D3", font-size: 5px }}>${position}</em>
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