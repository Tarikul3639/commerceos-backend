import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayNotEmpty,
    IsArray,
    IsNotEmpty,
    IsObject,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateSizeGuideDto {
    @ApiProperty({ example: 'Panjabi' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiPropertyOptional({ example: "Men's panjabi size guide" })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 'cm', default: 'cm' })
    @IsString()
    @IsNotEmpty()
    unit: string = 'cm';

    @ApiProperty({
        example: ['Size', 'Chest', 'Shoulder', 'Length', 'Sleeve'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    columns!: string[];

    @ApiProperty({
        example: [
            {
                Size: 'S',
                Chest: 102,
                Shoulder: 43,
                Length: 102,
                Sleeve: 58,
            },
            {
                Size: 'M',
                Chest: 107,
                Shoulder: 45,
                Length: 104,
                Sleeve: 59,
            },
        ],
        type: [Object],
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsObject({ each: true })
    rows!: Record<string, string | number>[];
}
