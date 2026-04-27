import { ApiProperty } from '@nestjs/swagger';

export class PostResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() slug: string;
  @ApiProperty({ required: false }) content: string | null;
  @ApiProperty({ required: false }) imageUrl: string | null;
  @ApiProperty() published: boolean;
  @ApiProperty() authorId: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
  @ApiProperty({ required: false }) publishedAt: Date | null;
}
