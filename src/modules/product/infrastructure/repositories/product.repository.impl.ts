import { Injectable } from '@nestjs/common';
import { BaseRepositoryImpl } from '@shared/base';
import { PrismaService } from '@shared/database';
import { Product } from '../../domain/entities/product.entity';
import { ProductMapper } from '../mappers/product.mapper';

@Injectable()
export class ProductRepositoryImpl extends BaseRepositoryImpl<Product, any> {
  constructor(prisma: PrismaService) {
    super(prisma, 'product');
  }

  protected toDomain(model: any): Product {
    return ProductMapper.toDomain(model);
  }
  protected toCreateData(entity: Product): any {
    return {
      id: entity.getId(),
      name: entity.getName(),
      price: entity.getPrice(),
    };
  }
  protected toUpdateData(entity: Product): any {
    return {
      name: entity.getName(),
      price: entity.getPrice(),
    };
  }
  protected getId(entity: Product): string {
    return entity.getId();
  }
}
