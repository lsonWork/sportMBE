import { Expose } from "class-transformer";
export class CourtImagesResponseDto {
  @Expose()
  imageUrl: string;
}