import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto, RefreshTokenDto, ResendEmailDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryAuthDto } from './dto/query-auth.dto';
import { ResponseInterceptor } from 'src/common/interceptors/responseInterceptor';


@ApiTags('Auth User Apis')
@UseInterceptors(ResponseInterceptor)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('change-password/:token')
  changePassword(@Body() body: { email: string, oldPassword: string, newPassword: string }, @Param('token') token: string) {
    return this.authService.changePassword(body.email, body.oldPassword, body.newPassword, token);
  }


  // TODO: implement the 2factor authentication 
  @Post('login')
  login(@Body() payload: LoginDto, @Req() req: Request) {
    return this.authService.login(payload, req.headers['user-agent']);
  }
  
  @Post('verify-2FA')
  verify2FA(@Body() payload: { userId: string, token: string }) {
    return this.authService.verify2FA(payload);
  }

  // @UseGuards(JwtAuthGuard)
  @Post('resend-mail')
  resendMail(@Body() payload: ResendEmailDto) {
    return this.authService.resendMail(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh-token')
  refreshToken(@Body() payload: RefreshTokenDto) {
    return this.authService.refreshToken(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  findAll(@Query() query: QueryAuthDto ) {
    return this.authService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    return this.authService.findOne(id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
