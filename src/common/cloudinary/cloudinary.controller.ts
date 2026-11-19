import {
  BadRequestException,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserJwtAuthGuard } from '../guards/user-jwt-auth.guard.js';
import { CloudinaryUploadGuard } from './cloudinary-upload.guard.js';

import {
  CloudinaryFolder,
  type CloudinaryFolderType,
} from './cloudinary.types.js';

import { CloudinaryService } from './cloudinary.service.js';

import { CloudinaryUploadSignatureDto } from './dto/responses/cloudinary-upload-signature.dto.js';

@ApiTags('Cloudinary')
@ApiBearerAuth()
@Controller('uploads')
@UseGuards(UserJwtAuthGuard, CloudinaryUploadGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Get('signature/:folder')
  @Header('Cache-Control', 'no-store, private')
  @Header('Pragma', 'no-cache')
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
