import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendRequestDTO {
  @IsString()
  @IsNotEmpty()
  toId: string;
}
