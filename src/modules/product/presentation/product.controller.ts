import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { createBaseController } from '@shared/base';
import { CreateProductDto } from '../application/dtos/create-product.dto';
import { UpdateProductDto } from '../application/dtos/update-product.dto';
import { ProductResponseDto } from '../application/dtos/product-response.dto';
import { CreateProductCommand } from '../application/commands/create-product/create-product.command';
import { UpdateProductCommand } from '../application/commands/update-product/update-product.command';
import { DeleteProductCommand } from '../application/commands/delete-product/delete-product.command';
import { GetProductQuery } from '../application/queries/get-product/get-product.query';
import { ListProductsQuery } from '../application/queries/list-products/list-products.query';

const BaseProductController = createBaseController({
  name: 'Products',
  createDto: CreateProductDto,
  updateDto: UpdateProductDto,
  responseDto: ProductResponseDto,
  createCommand: CreateProductCommand,
  updateCommand: UpdateProductCommand,
  deleteCommand: DeleteProductCommand,
  getByIdQuery: GetProductQuery,
  listQuery: ListProductsQuery,
});

export class ProductController extends BaseProductController {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }
}
