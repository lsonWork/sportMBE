import { Expose } from 'class-transformer';

export class OwnerPaymentInfoResponseDto {
  @Expose()
  accountName: string;

  @Expose()
  accountNumber: string;

  @Expose()
  bankName: string;

  @Expose()
  qrCodeUrl: string;
}