import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateAuthDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    city : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    state : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    country : string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    roleId : string;
}


export class LoginDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password : string;
}

export class ResendEmailDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email : string
}

export class RefreshTokenDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    oldRefreshToken : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    oldAccessToken : string;
}