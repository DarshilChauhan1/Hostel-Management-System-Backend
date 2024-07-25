import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional } from "class-validator";

export class QueryAuthDto {
    @ApiProperty()
    @IsNumber()
    @IsOptional()
    skip : number;

    @ApiProperty()
    @IsNumber()
    @IsOptional()
    limit : number;
}