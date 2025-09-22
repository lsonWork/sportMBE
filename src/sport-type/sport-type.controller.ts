import {
  Body,
  Controller,
  UseGuards,
  Request,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SportTypeService } from './sport-type.service';
import { Post } from '@nestjs/common';
import { CreateSportTypeDto } from './DTO/CreateSportTypeDto';
import { ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { EditSportTypeDto } from './DTO/EditSportTypeDto';
import { Public } from 'src/auth/public.decorator';

@Controller('sport-type')
export class SportTypeController {
  constructor(private readonly sportTypeService: SportTypeService) {}

  @ApiBearerAuth('access-token')
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
  @Post()
  async createSportType(@Body() createSportTypeDto: CreateSportTypeDto) {
    const result =
      await this.sportTypeService.createSportType(createSportTypeDto);
    return result;
  }

  // @ApiBearerAuth('access-token')
  // @UseGuards(RolesGuard)
  // @Roles(RoleEnum.ADMIN)
  @Public()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  async getSportType(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const result = await this.sportTypeService.getSportType(
      page,
      limit,
      search,
    );
    return result;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Basketball' },
      },
    },
  })
  async editSportType(
    @Param('id') id: string,
    @Body() editSportTypeDto: EditSportTypeDto,
  ) {
    const result = await this.sportTypeService.editSportType(
      id,
      editSportTypeDto,
    );
    return result;
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @Delete(':id')
  async deleteSportType(@Param('id') id: string) {
    const result = await this.sportTypeService.deleteSportType(id);
    return result;
  }
}
