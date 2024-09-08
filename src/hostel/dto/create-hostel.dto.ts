import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";


export enum HostelType {
    STUDENT = 'student',
    PAYING_GUEST = 'paying_guest',
    CORPORATE = 'corporate',
    CASTE = 'caste',
    GENERAL = 'general'
  }
export class CreateHostelDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    address : string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    zipcode : string;

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
    hostelType : HostelType;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    rooms : number;

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    isBranch : boolean
}

// model Hostel {
//   id             String       @id @default(uuid()) @db.Uuid
//   name           String       @db.VarChar(255)
//   address        String       @db.VarChar(255)
//   zipcode        String       @db.VarChar(255)
//   city           String       @db.VarChar(255)
//   state          String       @db.VarChar(255)
//   country        String       @db.VarChar(255)
//   status         HostelStatus @default(PENDING)
//   hostelType     HostelType
//   rooms          Int          @default(0)
//   occupation     Int          @default(0)
//   parentHostelId String?      @db.Uuid
//   hostel_user    User?
//   Rooms          HostelRoom[]
//   createdBy      String       @db.Uuid
//   authUser       AuthUser     @relation(fields: [createdBy], references: [id])
//   assignedTo     String?      @db.Uuid
//   Feedback       Feedback[]
//   createdAt      DateTime     @default(now())
//   updatedAt      DateTime     @updatedAt
// }