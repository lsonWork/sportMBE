// src/user/user.controller.ts
import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Body,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { plainToClass } from 'class-transformer';
import { UserResponseDTO } from './DTO/UserDTO';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth('access-token')
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @GetUser() loggedInUser: JwtUser,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.findOneById(id);
    if (loggedInUser.userId !== user.userId) {
      throw new HttpException(
        { message: 'Bạn không thể xem thông tin cá nhân của người khác' },
        HttpStatus.FORBIDDEN,
      );
    }
    return plainToClass(UserResponseDTO, user, {
      excludeExtraneousValues: true,
    });
  }

  @ApiBearerAuth('access-token')
  @Patch(':id')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        fullName: { type: 'string', example: 'Luong Thanh Hoa' },
        email: { type: 'string', example: 'hoa.thanh.que@example.com' },
        avatarUrl: { type: 'string', example: 'http://example.com/avatar.jpg' },
        phoneNumber: { type: 'string', example: '0987654321' },
        bankAccount: { type: 'string', example: '123456789' },
        bio: { type: 'string', example: 'NguoiThanhHoaAnRauMa' },
        birthDate: { type: 'string', format: 'date', example: '1990-12-31' },
        documentUrl: { type: 'string', example: 'http://363636.com/doc.pdf' },
        gender: { type: 'boolean', example: true },
      },
    },
  })
  async updateProfile(
    @Param('id') id: string,
    @Body() updateRequest: UserResponseDTO,
    @GetUser() loggedInUser: JwtUser,
  ) {
    if (loggedInUser.userId !== id) {
      throw new HttpException(
        { message: 'Bạn không thể cập nhật thông tin cá nhân của người khác' },
        HttpStatus.FORBIDDEN,
      );
    }
    const updatedUser = await this.userService.updateUser(id, updateRequest);
    return updatedUser;
  }
}
