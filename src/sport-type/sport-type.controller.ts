import { Body, Controller, UseGuards } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { Post } from '@nestjs/common';
import { CreateSportTypeDto } from './DTO/CreateSportTypeDto';
import { ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';

@Controller('sport-type')
export class SportTypeController {
  constructor(private readonly sportTypeService: SportTypeService) {}

  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Basketball' },
      },
    },
  })
  @Post('create')
  async createSportType(@Body() createSportTypeDto: CreateSportTypeDto) {
    const result =
      await this.sportTypeService.createSportType(createSportTypeDto);
    return result;
  }
}
