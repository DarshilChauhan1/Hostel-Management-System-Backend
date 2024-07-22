export class ResponseBody {
    message: string;
    statusCode: number;
    success: boolean;
    data: any;
    
    constructor(message: string, data: any, statusCode: number, success: boolean) {
        this.message = message;
        this.data = data;
        this.statusCode = statusCode;
        this.success = success;
    }
}