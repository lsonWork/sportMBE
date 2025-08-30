import { Expose } from "class-transformer";

export class SportTypeResponseDto {
  @Expose()
  typeName: string;
}