import {
  CartItem,
  Category,
  Image,
  OrderItems,
  Review,
  WishlistItem,
} from '@prisma/client';

export class Product {
  id: string;
  title: string;
  price: number;
  old_price: number;
  rating?: number;
  promotion_time?: number;
  description: string;
  products_sold: number;
  endDate?: Date;
  bigsale: boolean;
  sku: string;
  stock: number;
  category: string;
  brand: string;
  tags: string[];
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  isActive: boolean;
  featured: boolean;
  color: string[];
  size: string[];
  images: Image[];
  OrderItems: OrderItems[];
  reviews: Review[];
  WishlistItem: WishlistItem[];
  CartItem: CartItem[];
  Category?: Category;
  categoryId?: string;
  createdAt: Date;
  updatedAt: Date;
}
