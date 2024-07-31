import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ResponseBody } from 'src/common/helpers/responseBody';

@Injectable()
export class RolesService {
  constructor(
    private readonly prismaService: PrismaService
  ) { }
  async create(createRoleDto: CreateRoleDto) : Promise<ResponseBody> {
    try {

      // check if the role is already exits or nots

      const checkRole = await this.prismaService.role.findUnique({
        where: {
          name: createRoleDto.name
        }
      })

      if (checkRole) throw new BadRequestException('Role already exist')

      const createRole = await this.prismaService.role.create({
        data: {
          ...createRoleDto
        }
      })

      return new ResponseBody('Role created successfully', createRole, 201, true)
    } catch (error) {
      throw error
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
