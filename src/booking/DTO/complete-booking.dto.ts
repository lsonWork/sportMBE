import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteBookingDto {
  @IsString()
  @IsNotEmpty()
  finalPaymentMethod: string; // Ví dụ: 'CASH', 'TRANSFER'
}