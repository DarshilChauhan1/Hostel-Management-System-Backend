import { Module } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { HostelController } from './hostel.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { ClsModule } from 'nestjs-cls';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports : [ClsModule],
  controllers: [HostelController],
  providers: [HostelService, PrismaService, AuthService, JwtService, PrismaService, MailService],
})
export class HostelModule {}
