import { ApiProperty } from '@nestjs/swagger';

export class SettingsResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    companyName!: string;

    @ApiProperty()
    companyEmail!: string;

    @ApiProperty()
    companyPhone!: string;

    @ApiProperty()
    companyAddress!: string;

    @ApiProperty({
        nullable: true,
    })
    logo!: string | null;

    @ApiProperty({
        nullable: true,
    })
    favicon!: string | null;

    @ApiProperty({
        example: 'BDT',
    })
    currency!: string;

    @ApiProperty({
        example: 'Asia/Dhaka',
    })
    timezone!: string;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}