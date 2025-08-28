import { IsString } from 'class-validator';

export class EditCourtDto {
  @IsString()
  name?: string;
  @IsString()
  address?: string;
  imgUrls?: string[];
  @IsString()
  sportType?: string;
  @IsString()
  description?: string;
  pricePerHour?: number;
  @IsString()
  subService?: string;
}
