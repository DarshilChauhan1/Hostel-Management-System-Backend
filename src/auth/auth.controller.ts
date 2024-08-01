import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QueryAuthDto } from './dto/query-auth.dto';


@ApiTags('Auth User Apis')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBearerAuth()
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

  @Post('refresh-token')
  refreshToken(@Body() body: { refreshToken: string, accessToken: string }) {
    return this.authService.refreshToken(body.refreshToken, body.accessToken);
  }

  @Get('all')
  findAll(@Query() query: QueryAuthDto ) {
    return this.authService.findAll(query);
  }

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
