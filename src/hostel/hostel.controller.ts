import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';

@Controller('hostel')
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Post('register')
  create(@Body() createHostelDto: CreateHostelDto, @Req() request : Request) {
    return this.hostelService.create(createHostelDto, request['user'].id);
  }

  @Get()
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
