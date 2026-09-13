import { ApiProperty } from '@nestjs/swagger';

export class SupplierResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty({
        example: 'ABC Trading',
    })
    name!: string;

    @ApiProperty({
        example: 'contact@abctrading.com',
        nullable: true,
    })
    email!: string | null;

    @ApiProperty({
        example: '+8801712345678',
        nullable: true,
    })
    phone!: string | null;

    @ApiProperty({
        example: 'Dhaka, Bangladesh',
        nullable: true,
    })
    address!: string | null;

    @ApiProperty({
        example: 'John Doe',
        nullable: true,
    })
    contactPerson!: string | null;

    @ApiProperty({
        example: true,
    })
    isActive!: boolean;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}