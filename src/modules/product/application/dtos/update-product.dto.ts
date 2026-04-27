import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ required: false, example: 'Widget Pro' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 39.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
