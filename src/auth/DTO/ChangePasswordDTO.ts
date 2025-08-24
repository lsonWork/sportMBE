import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class ChangePasswordDTO {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'New password is required' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/, {
    message:
      'Password must be at least 6 characters long and contain letters and numbers',
  })
  newPassword: string;
}
