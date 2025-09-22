import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class LoginDTO {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email is invalid' })
  email: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Password is required' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message:
      'Password must be at least 6 characters long and contain letters and numbers',
  })
  password: string;

  @IsOptional()
  fullName: string;
}
