import { User } from '../../domain/entities/user.entity';
import { User as PrismaUser } from '@prisma/client';
import { UserResponseDto } from '../../application/dtos/user-response.dto';

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return User.reconstitute(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.avatarUrl,
      prismaUser.role,
      prismaUser.createdAt,
      prismaUser.updatedAt,
      prismaUser.deletedAt,
    );
  }

  static toResponseDto(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.getId();
    dto.email = user.getEmail();
    dto.name = user.getName();
    dto.avatarUrl = user.getAvatarUrl();
    dto.role = user.getRole();
    dto.createdAt = user.getCreatedAt();
    dto.updatedAt = user.getUpdatedAt();
    return dto;
  }
}
