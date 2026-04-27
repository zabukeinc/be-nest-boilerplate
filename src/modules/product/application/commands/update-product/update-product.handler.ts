import { Inject } from '@nestjs/common';
import { BaseUpdateHandler } from '@shared/base';
import { Product } from '../../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../../domain/repositories/product.repository.interface';

export class UpdateProductHandler extends BaseUpdateHandler<Product> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: IProductRepository) {
    super();
  }

  protected async findEntity(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }
  protected async updateEntity(entity: Product, data: any): Promise<Product> {
    if (data.name !== undefined) {
      entity.updateName(data.name);
    }
    if (data.price !== undefined) {
      entity.updatePrice(data.price);
    }
    return entity;
  }
  protected async saveEntity(entity: Product): Promise<Product> {
    return this.repository.update(entity);
  }
  protected getEntityId(entity: Product): string {
    return entity.getId();
  }
}
