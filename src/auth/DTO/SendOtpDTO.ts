import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendOtpDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;
}
