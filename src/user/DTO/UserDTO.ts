import { Expose, Type } from 'class-transformer';
import { OwnerPaymentInfoResponseDto } from './OwnerPaymentInfoResponseDto';

export class UserResponseDTO {
  @Expose() // Đánh dấu thuộc tính này sẽ được hiển thị
  userId: string;

  @Expose()
  fullName: string;

  @Expose()
  email: string;

  @Expose()
  birthDate: Date;

  @Expose()
  gender: boolean;

  @Expose()
  phoneNumber: string;

  @Expose()
  avatarUrl: string;

  @Expose()
  role: string;

  @Expose()
  status: boolean;

  @Expose()
  documentUrl: string;

  @Expose()
  bio: string;

  @Expose()
  @Type(() => OwnerPaymentInfoResponseDto)
  paymentInfo?: OwnerPaymentInfoResponseDto;
}
