import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangePasswordDTO {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'New password is required' })
  newPassword: string;
}
