import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { CourtService } from './court.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Pagination } from 'nestjs-typeorm-paginate';
import { CourtDto } from './DTO/courtDto';
import { plainToClass } from 'class-transformer';
import { Public } from 'src/auth/public.decorator';

@Controller('courts')
export class CourtPublicController {
  constructor(private readonly courtService: CourtService) {}

  @ApiBearerAuth('access-token')
  @Get('/')
  @Public()
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
    console.log(courtPage);
    const transformedItems = courtPage.items.map((court) =>
      plainToClass(CourtDto, court, {
        excludeExtraneousValues: true, // Rất quan trọng!
      }),
    );
    return new Pagination<CourtDto>(transformedItems, courtPage.meta);
  }

  @Public()
  @Get('near-by')
  async findOne(@Query('lat') lat: string, @Query('lng') lng: string) {
    const court = await this.courtService.findNearBy(
      Number.parseFloat(lat),
      Number.parseFloat(lng),
    );
    return court;
  }

  @Public()
  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string): Promise<CourtDto> {
    const courtEntity = await this.courtService.findDetailById(id);
    return plainToClass(CourtDto, courtEntity, { 
      excludeExtraneousValues: true,
    });
  }
}
