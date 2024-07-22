import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtAuthGuard } from './auth.guard';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Auth User Apis')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBearerAuth()
  @Post('create')
  create(@Body() createAuthDto: CreateAuthDto, @Req() req: Request) {
    return this.authService.create(createAuthDto, req['user'].id);
  }

  @Post('change-password/:token')
  changePassword(@Body() body: { email: string, oldPassword: string, newPassword: string }, @Param('token') token: string) {
    return this.authService.changePassword(body.email, body.oldPassword, body.newPassword, token);
  }

  @Post('login')
  login(@Body() body: { email: string, password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
