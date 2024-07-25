import { Injectable } from '@nestjs/common';
import Mailgen from 'mailgen';

@Injectable()
export class MailService {
    constructor(){}

    private static emailTypes = {
        
    }

    private async emailGenerator(token : string){
        const mailGen = new Mailgen({
            theme : 'default',
            product : {
                name : 'NestJS Auth',
                link : 'https://nestjs-auth.com'
            }
        })

        const email = {
            body : {
                name : 'Dear User',
                intro : 'Welcome to NestJS Auth! We are very excited to have you on board.',
                action : {
                    instructions : 'To get started with NestJS Auth, please click here:',
                    button : {
                        color : '#22BC66',
                        text : 'Confirm your account',
                        //TODO: add the link to the button (frontend link)
                        link : `https://nestjs-auth.com?token=${token}`
                    }
                },
                outro : 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }

        }

        const emailTemplate = mailGen.generate(email);
        return emailTemplate;
    }

    async sendAuthVeificationEmail(email: string, token: string) {
        
    }
}
