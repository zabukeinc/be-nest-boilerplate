import { Inject } from '@nestjs/common';
import { BaseListHandler } from '@shared/base';
import { Product } from '../../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../../domain/repositories/product.repository.interface';
import { ProductResponseDto } from '../../dtos/product-response.dto';
import { ProductMapper } from '../../../infrastructure/mappers/product.mapper';

export class ListProductsHandler extends BaseListHandler<Product, ProductResponseDto> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: IProductRepository) {
    super();
  }

  protected async findEntities(pagination: any): Promise<{ items: Product[]; pagination: any }> {
    return this.repository.findAll(
      pagination.page || 1,
      pagination.limit || 10,
      pagination.sortBy,
      pagination.sortOrder,
    );
  }
  protected toResponseDto(entity: Product): ProductResponseDto {
    return ProductMapper.toResponseDto(entity);
  }
}
