export class CustomError extends Error {
    statusCode: number;
    message: string;
    redirectTo?: string;
    constructor(statusCode: number, message: string, redirectTo?: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.redirectTo = redirectTo
    }
}