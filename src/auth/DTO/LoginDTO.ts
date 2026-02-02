import { IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty({ message: 'Email or phone number is required' })
  emailOrPhone: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsOptional()
  fullName: string;

  @IsOptional()
  avatarUrl: string;
}
