// src/user/user.controller.ts
import {
  Controller,
  Get,
  Param,
  HttpStatus,
  HttpException,
  Body,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { plainToClass } from 'class-transformer';
import { UserResponseDTO } from './DTO/UserDTO';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import type { JwtUser } from 'src/common/decorators/get-user.decorator';
import { UpdateOwnerPaymentInfoDto } from './DTO/UpdatePaymentInformationDto';
import { OwnerPaymentInfo } from './entities/owner-payment-info.entity';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/role.decorator';
import { Role, Role as RoleEnum } from 'src/common/enum/Role';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiBearerAuth('access-token')
  @Patch('payment-info')
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.OWNER)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        accountName: {
          type: 'string',
          example: 'NGUYEN VAN A',
          description: 'Tên chủ tài khoản (viết hoa, không dấu)',
        },
        accountNumber: {
          type: 'string',
          example: '0123456789',
          description: 'Số tài khoản ngân hàng',
        },
        bankName: {
          type: 'string',
          example: 'Vietcombank',
          description: 'Tên ngân hàng',
        },
        qrCodeUrl: {
          type: 'string',
          format: 'url',
          example: 'https://api.vietqr.io/image/970436-0123456789-....png',
          description: 'Đường dẫn URL đến ảnh mã QR',
        },
      },
    },
  })
  async updatePaymentInfo(
    @GetUser() user: JwtUser,
    @Body() updatePaymentInfoDto: UpdateOwnerPaymentInfoDto,
  ): Promise<OwnerPaymentInfo> {
    return this.userService.upsertOwnerPaymentInfo(
      user.userId,
      updatePaymentInfoDto,
    );
  }

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
    const { paymentInfo, ...userUpdateData } = updateRequest;

    // 2. Cập nhật các thông tin của User
    // Hàm updateUser chỉ nên nhận các thuộc tính của User
    await this.userService.updateUser(id, userUpdateData);

    // 3. Nếu có thông tin paymentInfo, gọi hàm riêng để cập nhật nó
    if (loggedInUser.role === Role.OWNER && paymentInfo) {
      await this.userService.upsertOwnerPaymentInfo(id, paymentInfo);
    }

    // 4. Lấy lại thông tin user đầy đủ để trả về
    return this.userService.findOneById(id);
  }
}
