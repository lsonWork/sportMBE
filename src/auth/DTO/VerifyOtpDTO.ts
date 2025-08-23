import { IsEmail, IsNotEmpty } from 'class-validator';

export class VerifyOtpDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
  @IsNotEmpty({ message: 'Otp is required' })
  otp: string;
}
