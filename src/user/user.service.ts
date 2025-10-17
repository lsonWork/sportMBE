import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/common/enum/Role';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { UpdateProfileDto } from './DTO/UpdateProfileDto';
import { JwtService } from '@nestjs/jwt';
import { UpdateOwnerPaymentInfoDto } from './DTO/UpdatePaymentInformationDto';
import { OwnerPaymentInfo } from './entities/owner-payment-info.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(OwnerPaymentInfo)
    private readonly paymentInfoRepository: Repository<OwnerPaymentInfo>,
  ) {}

  async paginate(
    options: IPaginationOptions,
    role?: Role,
    search?: string,
  ): Promise<Pagination<User>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');
    queryBuilder.orderBy('user.fullName', 'ASC');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role: role });
    }

    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return paginate<User>(queryBuilder, options);
  }
  async findOneById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { userId: userId },
      relations: ['paymentInfo'],
    });

    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
  async updateStatus(userId: string, status: boolean): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    user.status = status;
    await this.userRepository.save(user);
  }

  async updateUser(
    userId: string,
    updateData: Partial<User>,
  ): Promise<UpdateProfileDto> {
    await this.userRepository.update(userId, updateData);
    const updatedUser = await this.userRepository.findOne({
      where: { userId },
      relations: ['paymentInfo'], // Tải luôn paymentInfo
    });
    if (!updatedUser) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    const payload = {
      email: updatedUser.email,
      userId: updatedUser.userId,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
    };
    const token = this.jwtService.sign(payload);
    const responseDto: UpdateProfileDto = {
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatarUrl,
      phoneNumber: updatedUser.phoneNumber,
      bio: updatedUser.bio,
      birthDate: updatedUser.birthDate,
      documentUrl: updatedUser.documentUrl,
      gender: updatedUser.gender,
      token: token,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    if (updatedUser.role === Role.OWNER && updatedUser.paymentInfo) {
      responseDto.paymentInfo = updatedUser.paymentInfo;
    }
    return responseDto;
  }
  async updateClientToOwner(userId: string): Promise<void> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new HttpException(
        { message: 'User not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    if ((user.role = Role.CLIENT)) {
      user.role = Role.OWNER;
    }
    if ((user.role = Role.OWNER)) {
      user.role = Role.CLIENT;
    }
    await this.userRepository.save(user);
  }
  async upsertOwnerPaymentInfo(
    userId: string,
    dto: UpdateOwnerPaymentInfoDto,
  ): Promise<OwnerPaymentInfo> {
    let paymentInfo = await this.paymentInfoRepository.findOneBy({
      user: { userId },
    });

    if (paymentInfo) {
      Object.assign(paymentInfo, dto);
    } else {
      paymentInfo = this.paymentInfoRepository.create({
        ...dto,
        user: { userId } as User,
      });
    }

    return this.paymentInfoRepository.save(paymentInfo);
  }
}
