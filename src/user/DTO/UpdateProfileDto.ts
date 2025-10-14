import { IsDate, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  fullName: string;

  @IsString()
  email: string;

  @IsString()
  avatarUrl: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  bio: string;

  @IsDate()
  birthDate: Date;

  @IsString()
  documentUrl: string;

  @IsString()
  gender: boolean;

  @IsString()
  token: string;
}
