import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.headers['authorization'];
        if (!token) return false;

        // verify the tokens
        return await this.verifyToken(token);
    }

    async verifyToken(token: string) {
        // check for bearer mark
        const checkBearer = token.split(' ')[0];
        if (checkBearer !== 'Bearer') return false;

        // check for token
        const checkToken = token.split(' ')[1];
        if (!checkToken) return false;

        // verify the token
        const verify = await this.jwtService.verifyAsync(checkToken, { secret: process.env.ACCESS_TOKEN_SECRET });
        if (!verify) return false;
        return true;
    }
}