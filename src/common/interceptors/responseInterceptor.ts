import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common"
import { map } from "rxjs"

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