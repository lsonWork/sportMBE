import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateRatingDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  star: number;

  @IsString()
  @IsOptional()
  content?: string;
}
