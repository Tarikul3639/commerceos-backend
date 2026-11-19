import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmailStatus } from '../../../../lib/prisma/client.js';

export class EmailLogResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() to!: string;
  @ApiProperty() subject!: string;
  @ApiProperty({
    description:
      'Safe template or message summary; rendered content is never exposed.',
  })
  preview!: string;
  @ApiProperty({ enum: EmailStatus }) status!: EmailStatus;
  @ApiProperty() attemptCount!: number;
  @ApiPropertyOptional({ nullable: true }) sentAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) entityType!: string | null;
  @ApiPropertyOptional({ nullable: true }) entityId!: string | null;
  @ApiPropertyOptional({ nullable: true }) triggeredById!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
}
