import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiParam, ApiTags } from '@nestjs/swagger';

import {
  CloudinaryFolder,
  type CloudinaryFolderType,
} from './cloudinary.types.js';

import { CloudinaryService } from './cloudinary.service.js';

import { CloudinaryUploadSignatureDto } from './dto/responses/cloudinary-upload-signature.dto.js';

@ApiTags('Cloudinary')
@Controller('uploads')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('signature/:folder')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully generated Cloudinary upload signature',
    type: CloudinaryUploadSignatureDto,
  })
  @ApiOperation({
    summary: 'Generate Cloudinary upload signature',
    description:
      'Generates a signed upload signature for the specified folder. The frontend uses this signature to upload files directly to Cloudinary.',
  })
  @ApiParam({
    name: 'folder',
    enum: CloudinaryFolder,
    description: 'Cloudinary upload folder',
  })
  generateSignature(
    @Param('folder')
    folder: CloudinaryFolderType,
  ): CloudinaryUploadSignatureDto {
    const validFolders = Object.values(CloudinaryFolder);

    if (!validFolders.includes(folder)) {
      throw new BadRequestException('Invalid upload folder');
    }

    return this.cloudinaryService.generateUploadSignature(folder);
  }
}
