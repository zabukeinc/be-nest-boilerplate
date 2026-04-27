import { UpdateProductDto } from '../../dtos/update-product.dto';

export class UpdateProductCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateProductDto,
  ) {}
}
