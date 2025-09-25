import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateRatingDto {
  @IsString()
  @IsNotEmpty()
  courtId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(5)
  star: number;

  @IsString()
  @IsOptional()
  content?: string;
}
