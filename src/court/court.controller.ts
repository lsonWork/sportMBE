import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CourtService } from "./court.service";
import { Roles } from "src/common/decorators/role.decorator";
import { RolesGuard } from "src/common/guards/role.guard";
import { Role as RoleEnum } from "src/common/enum/Role";
import { CreateCourtRequestDto } from "./DTO/createCourtRequestDto";
import { Request } from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";

@Controller('court')
export class CourtController {
    constructor(private readonly courtService: CourtService) {}
    @Post('/create')
    @UseGuards(RolesGuard)
    @Roles(RoleEnum.OWNER)
    @ApiBody({
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', example: "Nguyen Van A" },
              address: { type: 'string', example: "Ha Noi" },
              imgUrls: { type: 'array', example: "aaaa.url" },
              sportType: { 
                  type: 'string',
                  format: 'uuid', 
                  description: 'ID của loại hình thể thao (Lấy từ API GET /sport-types)',
                  enum: [
                      '123e4567-e89b-12d3-a456-426614174000',
                      '987e6543-e21b-12d3-a456-426614174001',
                  ],
                  example: '123e4567-e89b-12d3-a456-426614174000',
              },
              description: { type: 'string', example: "asjdbaskdb" },
              pricePerHour: { type: 'double', example: 100 },
              subService: { type: 'string', example: "Thue vot" }
            },
          },
        })
    async createCourt(@Body() createCourtDto: CreateCourtRequestDto, @Request() req) {
        const loggedInUser = req.user;
        return this.courtService.createCourt(createCourtDto, loggedInUser);
    }
}