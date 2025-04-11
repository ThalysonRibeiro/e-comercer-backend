import { Category, Product } from '@prisma/client'; // Importar tipos do Prisma se necessário

export class CategoryEntity {
  id: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: CategoryEntity; // Relacionamento com a categoria pai
  children?: CategoryEntity[]; // Relacionamento com as subcategorias
  products?: Product[]; // Relacionamento com produtos

  createdAt: Date;
  updatedAt: Date;

  // constructor(partial: Partial<CategoryEntity>) {
  //   Object.assign(this, partial);
  // }
}
