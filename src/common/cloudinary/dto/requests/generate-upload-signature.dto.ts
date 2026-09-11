import { IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import {
    CloudinaryFolder,
    type CloudinaryFolderType,
} from '../../cloudinary.types';

export class GenerateUploadSignatureDto {
    @ApiProperty({
        enum: CloudinaryFolder,
        example: CloudinaryFolder.CATEGORIES,
        description: 'Cloudinary upload folder',
    })
    @IsEnum(CloudinaryFolder)
    folder!: CloudinaryFolderType;
}
