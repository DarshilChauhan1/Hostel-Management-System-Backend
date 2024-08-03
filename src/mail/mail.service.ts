import { Injectable } from '@nestjs/common';
import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    constructor() { }

    async sendMail(options) {
        console.log('options', options);
        const mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'NestJS',
                link: 'http://localhost:3000',
            },
        });

        // generate the plain text
        const plainTextEmail = mailGenerator.generatePlaintext(options.mailGenContent);

        // generate the html version
        const htmlEmail = mailGenerator.generate(options.mailGenContent);

        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            service : 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_SMTP_USER,
                pass: process.env.MAIL_SMTP_PASSWORD
            }
        })

        const mail = {
            from: process.env.MAIL_SMTP_USER,
            to: options.email,
            subject: options.subject,
            text: plainTextEmail,
            html: htmlEmail
        }

        try {
            await transporter.sendMail(mail);
            return {
                message: 'Email sent successfully',
                success : true
            }
        } catch (error) {
            console.log(error);
            throw error;
        }

    }

    sendAuthVeificationEmail(email: string, link: string, password: string) {
        return {
            body: {
                name: email,
                intro: 'Welcome to NestJS',
                action: {
                    instructions: 'To verify your account, please click here:',
                    button: {
                        color: '#22BC66',
                        text: 'Verify your account, Here is the Auto generated password: ' + password + 'Click on the link to verify your account',
                        link: link
                    }
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        }
    }
}
