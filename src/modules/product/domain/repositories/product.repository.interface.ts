import { IBaseRepository } from '@shared/base';
import { Product } from '../entities/product.entity';

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');

export interface IProductRepository extends IBaseRepository<Product> {}
