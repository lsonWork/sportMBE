import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { CreateSubscriptionDto } from './DTO/subcriptionDto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Request } from '@nestjs/common';
import { UpdateSubscriptionDto } from './DTO/updateSubcriptionDto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('subcription')
export class SubcriptionController {
  constructor(private readonly subcriptionService: SubcriptionService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gói Thanh Hóa' },
        price: { type: 'number', example: 36.36 },
        duration: { type: 'number', example: 36 },
        description: { type: 'string', example: 'Gói rau má' },
      },
    },
  })
  @Post()
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetUser() loggedInUser: JwtUser,
  ) {
    return this.subcriptionService.createSubscription(
      createSubscriptionDto,
      loggedInUser.userId,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Gói Thanh Hóa' },
        price: { type: 'number', example: 36.36 },
        duration: { type: 'number', example: 36 },
        description: { type: 'string', example: 'Gói rau má' },
      },
    },
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @GetUser() loggedInUser: JwtUser,
  ) {
    return this.subcriptionService.updateSubscription(
      id,
      updateSubscriptionDto,
      loggedInUser.userId,
    );
  }
  @Public()
  @Get()
  async findAll() {
    return this.subcriptionService.findAll();
  }
}
