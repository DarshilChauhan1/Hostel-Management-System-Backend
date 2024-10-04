import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaService } from './prisma/prisma.service';
import { MailModule } from './mail/mail.module';
import { RolesModule } from './roles/roles.module';
import { HostelModule } from './hostel/hostel.module';
import { RoomsModule } from './rooms/rooms.module';
import { UsersModule } from './users/users.module';


@Module({
  imports: [AuthModule, PrismaModule, MailModule, RolesModule, HostelModule, RoomsModule, UsersModule,
    // ClsModule.forRoot({
    //   plugins: [
    //     new ClsPluginTransactional({
    //       imports: [PrismaModule],
    //       adapter: new TransactionalAdapterPrisma({
    //         prismaInjectionToken: PrismaService
    //       })
    //     })
    //   ],
    //   middleware: { mount: true },
    //   global: true
    // })
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule { }
