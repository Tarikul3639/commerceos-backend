import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSizeChartDto {
    @ApiProperty({ example: 'Men Clothing' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name!: string;
}