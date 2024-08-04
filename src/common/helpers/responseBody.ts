import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import exp from "constants";
import { map, Observable } from "rxjs";

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

export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): any {
        const response = context.switchToHttp().getResponse()

        return next.handle().pipe(map((data) => {
            // set the response status according to the status code from response body
            response.status(data.statusCode)
            return data
        }))
    }
}