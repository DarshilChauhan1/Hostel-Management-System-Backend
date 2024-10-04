import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('hostel')
@UseGuards(JwtAuthGuard)
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('create')
  create(@Body() createHostelDto: CreateHostelDto, @Req() request : Request) {
    return this.hostelService.create(createHostelDto, request['user'].userId);
  }

  @Get('all')
  findAll() {
    return this.hostelService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.hostelService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHostelDto: UpdateHostelDto) {
    return this.hostelService.update(+id, updateHostelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hostelService.remove(+id);
  }
}
