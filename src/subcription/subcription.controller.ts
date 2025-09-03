import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { SubcriptionService } from './subcription.service';
import { CreateSubscriptionDto } from './DTO/subcriptionDto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role as RoleEnum } from 'src/common/enum/Role';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Request } from '@nestjs/common';

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
        name: { type: 'string', example: 'Basketball' },
        price: { type: 'number', example: 9.99 },
        duration: { type: 'number', example: 30 },
        description: { type: 'string', example: 'A popular sport' },
      },
    },
  })
  @Post()
  async create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    const loggedInUser = req.user;
    return this.subcriptionService.createSubscription(createSubscriptionDto, loggedInUser);
  }
}
