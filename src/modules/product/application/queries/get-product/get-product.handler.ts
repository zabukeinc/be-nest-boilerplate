import { Inject } from '@nestjs/common';
import { BaseGetByIdHandler } from '@shared/base';
import { Product } from '../../../domain/entities/product.entity';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../../domain/repositories/product.repository.interface';
import { ProductResponseDto } from '../../dtos/product-response.dto';
import { ProductMapper } from '../../../infrastructure/mappers/product.mapper';

export class GetProductHandler extends BaseGetByIdHandler<Product, ProductResponseDto> {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: IProductRepository) {
    super();
  }

  protected async findEntity(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }
  protected toResponseDto(entity: Product): ProductResponseDto {
    return ProductMapper.toResponseDto(entity);
  }
}
