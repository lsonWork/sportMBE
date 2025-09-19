import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CourtService } from './court.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CourtDto } from './DTO/courtDto';
import { plainToClass } from 'class-transformer';

@Controller('courts')
export class CourtPublicController {
  constructor(private readonly courtService: CourtService) {}

  @ApiBearerAuth('access-token')
  @Get('/')
  @ApiQuery({
    name: 'sportTypeId',
    required: false,
    type: String,
    description: 'ID của loại hình thể thao',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Từ khóa tìm kiếm',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
    @Query('sportTypeId') sportTypeId?: string,
    @Query('search') search?: string,
  ): Promise<Pagination<CourtDto>> {
    limit = limit > 100 ? 100 : limit;
    const courtPage = await this.courtService.paginate(
      { page, limit },
      sportTypeId,
      search,
    );
    const transformedItems = courtPage.items.map((court) =>
      plainToClass(CourtDto, court, {
        excludeExtraneousValues: true, // Rất quan trọng!
      }),
    );

    return new Pagination<CourtDto>(transformedItems, courtPage.meta);
  }
}
