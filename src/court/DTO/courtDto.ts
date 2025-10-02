import { Expose, Transform, Type } from 'class-transformer';
import { SportTypeResponseDto } from './sportTypeResponseDto';
import { CourtImagesResponseDto } from './courtImagesResponseDto';
import { UserResponseDTO } from 'src/user/DTO/UserDTO';

export class CourtDto {
  @Expose()
  courtId: string;

  @Expose()
  courtName: string;

  @Expose()
  @Type(() => CourtImagesResponseDto) // Dùng @Type cho mảng các object lồng nhau
  @Transform(({ value }: { value: CourtImagesResponseDto[] }) => {
    // Bước 2: Sau khi đã có mảng các DTO con, mới map để lấy ra string
    if (value && Array.isArray(value)) {
      return value.map((imageDto) => imageDto.imageUrl);
    }
    return [];
  })
  courtImages: string[];

  @Expose()
  address: string;

  @Expose()
  description: string;

  @Expose()
  subService: string;

  @Expose()
  isActive: boolean;

  @Expose()
  pricePerHour: number;

  @Expose()
  @Type(() => SportTypeResponseDto) // Dùng @Type để chỉ định DTO cho object lồng nhau
  sportType: string;

  @Expose()
  avgRating: number;

  @Expose()
  @Type(() => UserResponseDTO) // <-- 2. Dùng @Type để NestJS biết cách biến đổi object User
  owner: UserResponseDTO;
}
