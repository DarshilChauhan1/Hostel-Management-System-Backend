import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateAuthDto, LoginDto, RefreshTokenDto, ResendEmailDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import crypto from 'crypto';
import moment from 'moment';
import { ResponseBody } from 'src/common/helpers/responseBody';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from 'src/common/errors/customError';;
import { QueryAuthDto } from './dto/query-auth.dto';
import { MailService } from 'src/mail/mail.service';
import * as speakeasy from '@levminer/speakeasy';
import * as qr from 'qrcode';
import { User } from '@prisma/client';


@Injectable()
export class AuthService {
   constructor(
      private readonly prismaService: PrismaService,
      // private readonly transaction: TransactionHost<TransactionalAdapterPrisma>,
      private readonly jwtService: JwtService,
      private readonly mailService: MailService
   ) { }
   async create(createAuthDto: CreateAuthDto): Promise<any> {
      try {

         const existUser = await this.findOneUser({ email: createAuthDto.email });

         if (existUser.success) throw new BadRequestException('User already exist');

         // generate random password
         const password = this.generateRandomPassword();
         const { unHashedToken, hashedToken, verificationExpiry } = this.generateVerificationTokens();
         console.log(unHashedToken)
         const user = await this.prismaService.authUser.create({
            data: {
               ...createAuthDto,
               // createdBy: userId,
               password,
               verificationToken: hashedToken,
               verificationTokenExpires: verificationExpiry
            }
         })

         // send email to verify the password and change it
         const response = await this.mailService.sendMail({
            email: user.email,
            subject: 'To verify your account',
            mailGenContent: this.mailService.sendAuthVeificationEmail(user.email, `http://localhost:3000/auth/change-password/${unHashedToken}`, password)
         })

         if (response.success) return new ResponseBody('User created successfully', user, 201, true);


      } catch (error) {
         console.log("error----->", error);
         throw error
      }
   }

   async changePassword(email: string, oldPassword: string, newPassword: string, token: string): Promise<ResponseBody> {
      try {

         const existUser = await this.findOneUser({ email });

         if (!existUser.success) throw new BadRequestException('User not found or already verified');

         const existUserData = existUser.data

         // create a function for token and password validation
         await this.tokenValidation({ token, verificationToken: existUserData.verificationToken, verificationTokenExpiry: existUserData.verificationTokenExpires });

         const isOldPasswordValid = existUserData.password === oldPassword;

         if (!isOldPasswordValid) throw new BadRequestException('Invalid old password');

         const newHashedPassword = await bcrypt.hash(newPassword, 12);

         const { accessToken, refreshToken } = await this.generateJwtTokens(existUserData.id);

         await this.prismaService.authUser.update({
            where: {
               id: existUserData.id
            },
            data: {
               password: newHashedPassword,
               isVerified: true,
               refreshToken,
               verificationToken: null,
               verificationTokenExpires: null
            }
         })

         const newUser = await this.findOneUser({ id: existUserData.id });

         return new ResponseBody('Password changed successfully', { accessToken, refreshToken, user: newUser }, 200, true);

      } catch (error) {
         console.log("error----->", error);
         throw error
      }
   }

   async login(payload: LoginDto, userDeviceInfo: string): Promise<ResponseBody> {
      const { email, password } = payload;
      try {
         const findUser = await this.findOneUser({ email, isVerified: true });

         const { data } = findUser

         const existUser = data;

         if (!findUser.success) throw new BadRequestException('User not found');

         // check if user is blocked, if it is then check if the block time is expired
         // the blockUserCheck function will unblock the user if the block time is expired
         if (existUser.isBlocked) await this.blockUserCheck(existUser);

         // if login attempt is more than 5 block the user for 24 hours
         // the loginAttemptCheck function will block the user for 24 hours if the login attempt is more than 5
         if (existUser.loginAttempt > 5) await this.loginAttemptCheck(existUser);

         // check for password validation
         await this.passwordValidation({ enteredPassword: password, user: existUser });

         // lastly check for user if 2FA is enabled
         if (existUser.twoFactorEnabled) {
            // hit the api to verify 2FA
            return await this.twoFactorValidation({ user: existUser });
         }

         const { accessToken, refreshToken } = await this.generateJwtTokens(existUser.id);
         return new ResponseBody('Login successfully', { accessToken, refreshToken, user: existUser }, 200, true);

      } catch (error) {
         throw error
      }
   }

   async verify2FA(payload: { userId: string, token: string }) {
      try {
         const { userId, token } = payload;
         const user = await this.prismaService.authUser.findUnique({
            where: {
               id: userId
            }
         })

         if (!user) throw new BadRequestException('User not found');

         const isTokenValid = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
         })

         if (!isTokenValid) throw new BadRequestException('Invalid token');

         const { accessToken, refreshToken } = await this.generateJwtTokens(user.id);
         return new ResponseBody('Login successfully', { accessToken, refreshToken, user }, 200, true);

      } catch (error) {
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

   async refreshToken(payload: RefreshTokenDto) {
      try {
         const { oldAccessToken, oldRefreshToken } = payload
         // check for the accessToken is correct or not
         const decodedAccessToken = this.jwtService.verify(oldAccessToken, { secret: process.env.ACCESS_TOKEN_SECRET });

         if (!decodedAccessToken) throw new BadRequestException('Invalid access token');

         // check for the refreshToken is correct or not
         const decodeRefreshToken = this.jwtService.verify(oldAccessToken, { secret: process.env.REFRESH_TOKEN_SECRET });

         if (!decodeRefreshToken) throw new BadRequestException('Invalid refresh token');

         const { userId } = decodedAccessToken;
         const user = await this.prismaService.authUser.findUnique({
            where: {
               id: userId
            }
         })
         if (!user) throw new BadRequestException('User not found');

         if (user.refreshToken !== oldRefreshToken) throw new BadRequestException('Invalid refresh token');

         // generate new accessToken and rerefreshToken
         const { accessToken, refreshToken } = await this.generateJwtTokens(userId);
         await this.prismaService.authUser.update({
            where: {
               id: userId
            },
            data: {
               refreshToken
            }
         })

         return new ResponseBody('Token refreshed successfully', { accessToken, refreshToken }, 200, true);

      } catch (error) {
         throw error
      }
   }

   async resendMail(payload: ResendEmailDto) {
      try {
         const { email } = payload
         // find that if the person is exists on database and is not verified
         const findUser = this.prismaService.authUser.findUnique({
            where: {
               isVerified: false,
               isBlocked: false,
               email
            }
         })

         if (!findUser) throw new BadRequestException('User not found or already verified');

         const { unHashedToken, hashedToken, verificationExpiry } = this.generateVerificationTokens();
         console.log(unHashedToken)
         const generateRandomPassword = this.generateRandomPassword();

         // update the verification token and expiry date
         await this.prismaService.authUser.update({
            where: {
               email
            },
            data: {
               verificationToken: hashedToken,
               verificationTokenExpires: verificationExpiry,
               password: generateRandomPassword
            }
         })

         // send email to verify the password and change it
         const response = await this.mailService.sendMail({
            email,
            subject: 'To verify your account',
            mailGenContent: this.mailService.sendAuthVeificationEmail(email, `http://localhost:3000/auth/change-password/${unHashedToken}`, generateRandomPassword)
         })

         if (response.success) return new ResponseBody('Email sent successfully', null, 201, true);
      } catch (error) {
         console.log("error----->", error);
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

   private async findOneUser(payload: any): Promise<ResponseBody> {
      try {
         const findUser = await this.prismaService.authUser.findUnique({
            where: payload
         })
         return new ResponseBody('User fetched successfully', findUser, 200, true);
      } catch (error) {
         return new ResponseBody('User not found', null, 404, false);
      }
   }

   private async tokenValidation(payload: { token: string, verificationToken: string, verificationTokenExpiry: Date }): Promise<ResponseBody> {
      try {
         const { token, verificationToken, verificationTokenExpiry } = payload;
         const isTokenValid = crypto.createHash('sha256').update(token).digest('hex') === verificationToken;
         if (!isTokenValid) throw new BadRequestException('Invalid token');

         const isTokenExpired = moment(verificationTokenExpiry).isBefore(moment());
         if (isTokenExpired) throw new BadRequestException('Token expired');

         return {
            success: true,
            data: null,
            message: 'Token verified successfully',
            statusCode: 200
         }

      } catch (error) {
         throw error
      }
   }

   private async blockUserCheck(payload: any): Promise<ResponseBody> {
      try {
         // payload as user object
         const isBlockTimeExpired = moment(payload.blockedUntil).isBefore(moment());
         if (!isBlockTimeExpired) throw new CustomError(403, `you are blocked for ${moment(payload.blockedUntil).diff(moment().toDate(), 'hours')} hours`)
         // if block time is expired then unblock the user
         await this.prismaService.authUser.update({
            where: {
               id: payload.id
            },
            data: {
               isBlocked: false,
               loginAttempt: 0,
               blockedAt: null,
               blockedUntil: null
            }
         })

         return new ResponseBody('User unblocked successfully', null, 200, true);
      } catch (error) {
         throw error
      }
   }

   private async loginAttemptCheck(payload: any): Promise<ResponseBody> {
      try {
         // payload as user object
         await this.prismaService.authUser.update({
            where: {
               id: payload.id
            },
            data: {
               isBlocked: true,
               blockedAt: new Date().toISOString(),
               blockedUntil: moment().add(24, 'hours').toISOString()
            }
         })
         throw new CustomError(403, `user is blocked for ${moment(payload.blockedUntil).diff(moment(), 'hours')} hours due to multiple login attempts`)
      } catch (error) {
         throw error
      }
   }

   private async passwordValidation(payload: { enteredPassword: string, user: User }): Promise<ResponseBody> {
      try {
         const { enteredPassword, user } = payload;
         const isPasswordValid = await bcrypt.compare(enteredPassword, user.password);
         if (!isPasswordValid) {
            await this.prismaService.authUser.update({
               where: {
                  id: user.id
               },
               data: {
                  loginAttempt: {
                     increment: 1
                  }
               }
            })
            throw new BadRequestException('Invalid password');
         }

         return new ResponseBody('Password verified successfully', null, 200, true);
      } catch (error) {
         throw error
      }
   }

   private async twoFactorValidation(payload: { user: User }): Promise<ResponseBody> {
      try {
         const { user } = payload;
         const secret = speakeasy.generateSecret({ length: 20 })
         await this.prismaService.authUser.update({
            where: {
               id: user.id
            },
            data: {
               twoFactorSecret: secret.base32
            }
         })
         const QrCode = await qr.toDataURL(secret.otpauth_url);
         return new ResponseBody('2FA code generated successfully', { url: QrCode }, 200, true);

      } catch (error) {

      }
   }
}
