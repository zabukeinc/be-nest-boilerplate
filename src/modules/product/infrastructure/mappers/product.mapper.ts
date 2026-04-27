import { Product } from '../../domain/entities/product.entity';
import { ProductResponseDto } from '../../application/dtos/product-response.dto';

export class ProductMapper {
  static toDomain(prisma: any): Product {
    return Product.reconstitute(
      prisma.id,
      prisma.name,
      Number(prisma.price),
      prisma.createdAt,
      prisma.updatedAt,
      prisma.deletedAt,
    );
  }

  static toResponseDto(entity: Product): ProductResponseDto {
    const dto = new ProductResponseDto();
    dto.id = entity.getId();
    dto.name = entity.getName();
    dto.price = entity.getPrice();
    dto.createdAt = entity.getCreatedAt();
    dto.updatedAt = entity.getUpdatedAt();
    return dto;
  }
}
