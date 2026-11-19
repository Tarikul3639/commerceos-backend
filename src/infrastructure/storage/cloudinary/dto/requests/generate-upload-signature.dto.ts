import { IsEnum } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import {
  CloudinaryFolder,
  type CloudinaryFolderType,
} from '../../types/cloudinary.types.js';

export class GenerateUploadSignatureDto {
  @ApiProperty({
    enum: CloudinaryFolder,
    example: CloudinaryFolder.CATEGORIES,
    description: 'Cloudinary upload folder',
  })
  @IsEnum(CloudinaryFolder)
  folder!: CloudinaryFolderType;
}
