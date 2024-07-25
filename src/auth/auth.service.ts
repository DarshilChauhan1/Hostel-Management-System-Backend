import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionalAdapterPrisma, PrismaTransactionalClient } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import crypto from 'crypto';
import moment from 'moment';
import { ResponseBody } from 'src/common/helpers/responseBody';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'src/common/errors/customError';
import { UAParser } from 'ua-parser-js';
import { QueryAuthDto } from './dto/query-auth.dto';


@Injectable()
export class AuthService {
   constructor(
      private readonly prismaService: PrismaService,
      // private readonly transaction: TransactionHost<TransactionalAdapterPrisma>,
      private readonly jwtService: JwtService
   ) { }
   async create(createAuthDto: CreateAuthDto, userId: string): Promise<ResponseBody> {
      try {
         const { email, firstName, city, country, lastName, state } = createAuthDto;
         const existUser = await this.prismaService.authUser.findUnique({
            where: {
               email
            }
         })

         if (existUser) throw new BadRequestException('User already exist');

         // generate random password
         const password = this.generateRandomPassword();
         const { unHashedToken, hashedToken, verificationExpiry } = this.generateVerificationTokens();
         const user = await this.prismaService.authUser.create({
            data: {
               ...createAuthDto,
               createdBy: userId,
               password,
               verificationToken: hashedToken,
               verificationTokenExpires: verificationExpiry
            }
         })

         // send email to verify the password and change it


         return new ResponseBody('User created successfully', user, 201, true);

      } catch (error) {
         throw error
      }
   }

   async changePassword(email: string, oldPassword: string, newPassword: string, token: string): Promise<ResponseBody> {
      try {
         const existUser = await this.prismaService.authUser.findUnique({
            where: {
               email,
               isVerified: false,
            }
         })
         if (!existUser) throw new BadRequestException('User not found or already verified');

         const isTokenValid = crypto.createHash('sha256').update(token).digest('hex') === existUser.verificationToken;
         if (!isTokenValid) throw new BadRequestException('Invalid token');

         const isTokenExpired = moment(existUser.verificationTokenExpires).isBefore(moment());
         if (isTokenExpired) throw new BadRequestException('Token expired');

         const isOldPasswordValid = existUser.password === oldPassword;
         if (!isOldPasswordValid) throw new BadRequestException('Invalid old password');

         const newHashedPassword = await bcrypt.hash(newPassword, 12);

         await this.prismaService.authUser.update({
            where: {
               id: existUser.id
            },
            data: {
               password: newHashedPassword,
               isVerified: true,
               verificationToken: null,
               verificationTokenExpires: null
            }
         })

         const newUser = await this.prismaService.authUser.findUnique({
            where: {
               id: existUser.id
            },
            select: {
               password: false,
            }
         })

         const { accessToken, refreshToken } = await this.generateJwtTokens(existUser.id);
         return new ResponseBody('Password changed successfully', { accessToken, refreshToken, user: newUser }, 200, true);

      } catch (error) {
         throw error
      }
   }

   async login(payload: LoginDto, userDeviceInfo: string): Promise<ResponseBody> {
      const { email, password } = payload;
      try {
         const existUser = await this.prismaService.authUser.findUnique({
            where: {
               email,
               isVerified: true,
            }
         })

         if (!existUser) throw new BadRequestException('User not found');

         // check if user is blocked, if it is then check if the block time is expired
         if (existUser.isBlocked) {
            const isBlockTimeExpired = moment(existUser.blockedUntil).isBefore(moment());
            if (!isBlockTimeExpired) throw new CustomError(403, `user is blocked for ${moment(existUser.blockedUntil).diff(moment(), 'hours')} hours`)
            // if block time is expired then unblock the user
            await this.prismaService.authUser.update({
               where: {
                  id: existUser.id
               },
               data: {
                  isBlocked: false,
                  loginAttempt: 0,
                  blockedAt: null,
                  blockedUntil: null
               }
            })
         }

         // if login attempt is more than 5 block the user for 24 hours
         if (existUser.loginAttempt > 5) {
            await this.prismaService.authUser.update({
               where: {
                  id: existUser.id
               },
               data: {
                  isBlocked: true,
                  blockedAt: new Date().toISOString(),
                  blockedUntil: moment().add(24, 'hours').toISOString()
               }
            })
            throw new CustomError(403, `user is blocked for ${moment(existUser.blockedUntil).diff(moment(), 'hours')} hours`)
         }

         const isPasswordValid = await bcrypt.compare(password, existUser.password);
         if (!isPasswordValid) {
            await this.prismaService.authUser.update({
               where: {
                  id: existUser.id
               },
               data: {
                  loginAttempt: {
                     increment: 1
                  }
               }
            })
         }

         await this.prismaService.authUser.update({
            where: {
               id: existUser.id
            },
            data: {
               loginAttempt: 0
            }
         })

         const { accessToken, refreshToken } = await this.generateJwtTokens(existUser.id);
         return new ResponseBody('Login successfully', { accessToken, refreshToken, user: existUser }, 200, true);

      } catch (error) {
         console.log("error----->", error);
         throw error
      }
   }

   async findAll(query: QueryAuthDto) {
      try {
         const { skip, limit } = query;
         const users = await this.prismaService.authUser.findMany({
            skip,
            take: limit
         })
         return new ResponseBody('Users fetched successfully', users, 200, true);

      } catch (error) {
         throw error
      }
   }

   async findOne(id: string) {
      try {
         const user = await this.prismaService.authUser.findUnique({
            where: {
               id
            }
         })
         if (!user) throw new BadRequestException('User not found');
         return new ResponseBody('User fetched successfully', user, 200, true);

      }
      catch (error) {
         throw error
      }

   }

   update(id: number, updateAuthDto: UpdateAuthDto) {
      return `This action updates a #${id} auth`;
   }

   remove(id: number) {
      return `This action removes a #${id} auth`;
   }

   private generateRandomPassword() {
      const length = 8;
      const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let n = charset.length
      let retVal = "";
      for (let i = 0; i < length; ++i) {
         retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
   }

   private generateVerificationTokens() {
      const unHashedToken = crypto.randomBytes(32).toString('hex');

      const hashedToken = crypto.createHash('sha256').update(unHashedToken).digest('hex');

      const verificationExpiry = moment().add(10, 'minutes').toDate();

      return { unHashedToken, hashedToken, verificationExpiry }
   }

   private async generateJwtTokens(userId: string) {
      const accessToken = await this.jwtService.signAsync({ userId }, { expiresIn: '1h', secret: process.env.ACCESS_TOKEN_SECRET });
      const refreshToken = await this.jwtService.signAsync({ userId }, { expiresIn: '7d', secret: process.env.REFRESH_TOKEN_SECRET });

      return { accessToken, refreshToken }
   }
}
