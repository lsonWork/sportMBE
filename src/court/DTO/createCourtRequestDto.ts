import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateCourtRequestDto {
  @IsString()
  @IsNotEmpty({ message: "Court name is required" })
  name: string;

  @IsString()
  @IsNotEmpty({ message: "Address is required" })
  address: string;

  @IsArray({ message: "Images must be an array of URLs" })
  @ArrayNotEmpty({ message: "At least one image URL is required" })
  @IsNotEmpty({ message: "Image URL is required" })
  imgUrl: string[];

  @IsUUID('4', { message: 'Sport type must be a valid UUID' })
  @IsNotEmpty({ message: "Sport type is required" })
  sportType: string;

  @IsString()
  @IsNotEmpty({ message: "Description is required" })
  description: string;

  @IsNotEmpty({ message: "Price per hour is required" })
  pricePerHour: number;

  @IsString()
  @IsNotEmpty({ message: "Sub-service is required" })
  subService: string;
}