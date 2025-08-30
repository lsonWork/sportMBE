import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CourtService } from './court.service';
import { Roles } from 'src/common/decorators/role.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { CreateCourtRequestDto } from './DTO/createCourtRequestDto';
import { Request } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { EditCourtDto } from './DTO/editCourtDto';
import { Param, ParseUUIDPipe } from '@nestjs/common';
import { Court } from './entities/court.entity';
import { IPaginationOptions, Pagination } from 'nestjs-typeorm-paginate';
import { CourtDto } from './DTO/courtDto';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { plainToClass } from 'class-transformer';

@Controller('court')
export class CourtController {
  constructor(private readonly courtService: CourtService) {}
  @Post('/')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'San rau ma 36' },
        address: { type: 'string', example: 'Hoa Thanh Que' },
        imgUrls: {
          type: 'array',
          example: [
            'https://trangwebcuaban.com/anh1.jpg',
            'https://trangwebcuaban.com/anh2.jpg',
          ],
        },
        sportType: {
          type: 'string',
          format: 'uuid',
          description:
            'ID của loại hình thể thao (Lấy từ API GET /sport-types)',
          enum: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987e6543-e21b-12d3-a456-426614174001',
          ],
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        description: { type: 'string', example: 'asjdbaskdb' },
        pricePerHour: { type: 'double', example: 100 },
        subService: { type: 'string', example: 'Thue vot' },
      },
    },
  })
  async createCourt(
    @Body() createCourtDto: CreateCourtRequestDto,
    @Request() req,
  ) {
    const loggedInUser = req.user;
    return this.courtService.createCourt(createCourtDto, loggedInUser);
  }

  @Patch('/:id')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'San rau ma 36' },
        address: { type: 'string', example: 'Hoa Thanh Que' },
        imgUrls: {
          type: 'array',
          example: [
            'https://trangwebcuaban.com/anh1.jpg',
            'https://trangwebcuaban.com/anh2.jpg',
          ],
        },
        sportType: {
          type: 'string',
          format: 'uuid',
          description:
            'ID của loại hình thể thao (Lấy từ API GET /sport-types)',
          enum: [
            '123e4567-e89b-12d3-a456-426614174000',
            '987e6543-e21b-12d3-a456-426614174001',
          ],
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        description: { type: 'string', example: 'asjdbaskdb' },
        pricePerHour: { type: 'double', example: 100 },
        subService: { type: 'string', example: 'Thue vot' },
      },
    },
  })
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() editCourtDto: EditCourtDto,
    @Request() req,
  ) {
    const loggedInUser = req.user;
    return this.courtService.updateCourt(id, editCourtDto, loggedInUser);
  }

  @Get('/')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
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
