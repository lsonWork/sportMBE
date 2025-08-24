import { Body, Controller, UseGuards, Request } from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { Post } from '@nestjs/common';
import { CreateSportTypeDto } from './DTO/CreateSportTypeDto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { AuthGuard } from '@nestjs/passport';

@Controller('sport-type')
export class SportTypeController {
  constructor(private readonly sportTypeService: SportTypeService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
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
