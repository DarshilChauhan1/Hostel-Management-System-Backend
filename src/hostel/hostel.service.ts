import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBody } from 'src/common/helpers/responseBody';

@Injectable()
export class HostelService {
  constructor(
    private readonly prismaService: PrismaService,
  ) { }
  async create(createHostelDto: CreateHostelDto, userId: string) {
    try {
      const { isBranch } = createHostelDto;

      if (isBranch) {
        // find the main branch
        const mainHostel = await this.prismaService.hostel.findFirst({
          where: {
            createdBy: userId,
            parentHostelId: null
          }
        })
        if(!mainHostel) throw new BadRequestException('Main Hostel Not Found')

        // now create the branched hostel
        const branchedHostel = await this.prismaService.hostel.create({
          data: {
            ...createHostelDto,
            createdBy: userId,
            parentHostelId: mainHostel.id
          }
        })

        return new ResponseBody("Branched Hostel Created Successfully", branchedHostel, 201, true)

      }
      const hostel = await this.prismaService.hostel.create({
        data: {
          ...createHostelDto,
          createdBy: userId
        }
      })

      return new ResponseBody('Hostel Created Successfully', hostel, 201, true)

    } catch (error) {
      throw error
    }
  }

  findAll() {
    return `This action returns all hostel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hostel`;
  }

  update(id: number, updateHostelDto: UpdateHostelDto) {
    return `This action updates a #${id} hostel`;
  }

  remove(id: number) {
    return `This action removes a #${id} hostel`;
  }
}
