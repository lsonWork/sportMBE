import { IsString, IsOptional, IsUrl } from 'class-validator';

export class UpdateOwnerPaymentInfoDto {
  @IsString()
  @IsOptional()
  accountName?: string;

  @IsString()
  @IsOptional()
  accountNumber?: string;

  @IsString()
  @IsOptional()
  bankName?: string;

  @IsUrl()
  @IsOptional()
  qrCodeUrl?: string;
}
