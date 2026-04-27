import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProductController } from './presentation/product.controller';
import { PRODUCT_REPOSITORY } from './domain/repositories/product.repository.interface';
import { ProductRepositoryImpl } from './infrastructure/repositories/product.repository.impl';
import { CreateProductHandler } from './application/commands/create-product/create-product.handler';
import { UpdateProductHandler } from './application/commands/update-product/update-product.handler';
import { DeleteProductHandler } from './application/commands/delete-product/delete-product.handler';
import { GetProductHandler } from './application/queries/get-product/get-product.handler';
import { ListProductsHandler } from './application/queries/list-products/list-products.handler';

@Module({
  imports: [CqrsModule],
  controllers: [ProductController],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryImpl },
    CreateProductHandler,
    UpdateProductHandler,
    DeleteProductHandler,
    GetProductHandler,
    ListProductsHandler,
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductModule {}
