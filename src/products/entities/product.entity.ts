import { ImageDto, OptionsDto } from "../dto/create-product.dto";

export class Product {
  id: string;
  title: string;
  price: number;
  old_price: number;
  assessment?: number;
  promotion_time: number;
  description: string;
  products_sold: number;
  endDate: Date;
  bigsale: boolean;
  stock: number;
  category: string;
  brand: string;
  tags: string[];
  options: OptionsDto[];
  images: ImageDto[];
}
