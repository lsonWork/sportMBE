import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Subcription name is required' })
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Subcription price is required' })
  price: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Subcription duration is required' })
  duration: number;

  @IsString()
  @IsNotEmpty({ message: 'Subcription description is required' })
  description: string;
}
