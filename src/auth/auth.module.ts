import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { ClsModule } from 'nestjs-cls';

@Module({
  imports : [ClsModule],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtService, PrismaService],

})
export class AuthModule {}
