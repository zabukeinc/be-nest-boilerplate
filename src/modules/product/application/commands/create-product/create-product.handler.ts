import { Inject } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { BaseCreateHandler } from '@shared/base';
import { Product } from '../../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../../domain/repositories/product.repository.interface';
import { ProductCreatedEvent } from '../../../domain/events/product-created.event';

export class CreateProductHandler extends BaseCreateHandler<Product> {
  constructor(
    @Inject(PRODUCT_REPOSITORY) private readonly repository: IProductRepository,
    private readonly eventBus: EventBus,
  ) {
    super();
  }

  protected async validate(data: any): Promise<void> {}
  protected async createEntity(data: any): Promise<Product> {
    return Product.create(data.name, data.price);
  }
  protected async saveEntity(entity: Product): Promise<Product> {
    return this.repository.create(entity);
  }
  protected getEntityId(entity: Product): string {
    return entity.getId();
  }
  protected async afterCreate(entity: Product): Promise<void> {
    this.eventBus.publish(new ProductCreatedEvent(entity.getId(), entity.getName()));
  }
}
