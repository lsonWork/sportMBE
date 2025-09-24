import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('owner/payments')
export class PaymentOwnerController {
  constructor(private readonly paymentService: PaymentService) {}

  // Define your endpoints here
}
