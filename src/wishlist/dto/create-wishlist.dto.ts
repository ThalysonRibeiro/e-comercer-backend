import { IsNotEmpty, IsString } from "class-validator";

export class CreateWishlistDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsString()
  productId: string;
}
