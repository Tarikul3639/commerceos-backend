import { ApiProperty } from '@nestjs/swagger';

export class CloudinaryUploadSignatureDto {
    @ApiProperty({
        example: 1726060000,
        description: 'Unix timestamp used to generate the signature',
    })
    timestamp!: number;

    @ApiProperty({
        example: 'generated-cloudinary-signature',
        description: 'Cloudinary upload signature',
    })
    signature!: string;

    @ApiProperty({
        example: 'commerceos/categories',
        description: 'Cloudinary upload folder',
    })
    folder!: string;

    @ApiProperty({
        example: 'your-cloud-name',
        description: 'Cloudinary cloud name',
    })
    cloudName!: string;

    @ApiProperty({
        example: '123456789012345',
        description: 'Cloudinary API key',
    })
    apiKey!: string;
}