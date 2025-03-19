export class CreateProductDto {
  id: string;
  title: string;
  price: number;
  old_price: number;
  assessment: number;
  promotion_time: number;
  description: string;
  products_sold: number;
  endDate: Date;
  bigsale: boolean;
  sku: string;
  stock: number;
  category: string;
  brand: string;
  tags: string[];
  options: OptionsDto[];
  images: ImageDto[];
}

export class OptionsDto {
  id: string;
  color: string;
  size: string;
}

export class ImageDto {
  id: string;
  image: string;
}
