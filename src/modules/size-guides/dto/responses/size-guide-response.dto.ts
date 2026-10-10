
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SizeGuideResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({ example: 'Panjabi' })
    name!: string;

    @ApiPropertyOptional({
        example: "Men's panjabi size guide",
        nullable: true,
    })
    description?: string | null;

    @ApiProperty({ example: 'cm' })
    unit!: string;

    @ApiProperty({
        example: ['Size', 'Chest', 'Shoulder', 'Length', 'Sleeve'],
        type: [String],
    })
    columns!: string[];

    @ApiProperty({
        example: [{ Size: 'M', Chest: 107, Shoulder: 45, Length: 104, Sleeve: 59 }],
        type: [Object],
    })
    rows!: Record<string, string | number>[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}
