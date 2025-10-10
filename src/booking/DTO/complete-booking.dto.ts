import { IsNotEmpty, IsString } from 'class-validator';
import { PaymentMethod } from 'src/common/enum/PaymentMethod';

export class CompleteBookingDto {
  // @IsString()
  @IsNotEmpty()
  finalPaymentMethod: PaymentMethod;
}
