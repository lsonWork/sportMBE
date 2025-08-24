import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSportTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Sport name is required' })
  name: string;
}
