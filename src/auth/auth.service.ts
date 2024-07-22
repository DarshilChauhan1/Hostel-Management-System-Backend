import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
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


@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly transaction: TransactionHost<TransactionalAdapterPrisma>,
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

  async login(email: string, password: string): Promise<ResponseBody> {
    try {
      const existUser = await this.prismaService.authUser.findUnique({
        where: {
          email,
          isVerified: true
        }
      })

      if (!existUser) throw new BadRequestException('User not found');

      const isPasswordValid = await bcrypt.compare(password, existUser.password);
      if (!isPasswordValid) throw new BadRequestException('Invalid password');

      const { accessToken, refreshToken } = await this.generateJwtTokens(existUser.id);
      return new ResponseBody('Login successfully', { accessToken, refreshToken, user: existUser }, 200, true);

    } catch (error) {
      throw error
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
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
