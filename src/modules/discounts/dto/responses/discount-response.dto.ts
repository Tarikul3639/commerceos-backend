import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '@/lib/prisma/client';

export class DiscountResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiPropertyOptional({ nullable: true }) description!: string | null;
  @ApiProperty({ enum: DiscountType }) type!: DiscountType;
  @ApiProperty() value!: string;
  @ApiProperty() minOrderAmount!: string;
  @ApiPropertyOptional({ nullable: true }) maxDiscountAmount!: string | null;
  @ApiPropertyOptional({ nullable: true }) startsAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) endsAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) usageLimit!: number | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdById!: string;
  @ApiPropertyOptional({ nullable: true }) updatedById!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
