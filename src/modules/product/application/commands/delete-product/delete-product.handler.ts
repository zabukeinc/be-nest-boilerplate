import { Inject } from '@nestjs/common';
import { BaseDeleteHandler } from '@shared/base';
import {
  PRODUCT_REPOSITORY,
  IProductRepository,
} from '../../../domain/repositories/product.repository.interface';

export class DeleteProductHandler extends BaseDeleteHandler {
  constructor(@Inject(PRODUCT_REPOSITORY) private readonly repository: IProductRepository) {
    super();
  }

  protected async findEntity(id: string): Promise<any | null> {
    return this.repository.findById(id);
  }
  protected async deleteEntity(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
