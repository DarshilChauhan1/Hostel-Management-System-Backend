import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';

@Module({
  imports : [],
  providers: [PrismaService]
})
export class PrismaModule {}
