import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAuthDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    firstName : string;

    @ApiProperty()
    @IsString()
    @IsOptional()
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
    @IsString()
    @IsNotEmpty()
    roleId : string;
}
