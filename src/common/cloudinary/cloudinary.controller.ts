import {
    BadRequestException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
} from '@nestjs/common';

import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import {
    CloudinaryFolder,
    type CloudinaryFolderType,
} from './cloudinary.types';

import { CloudinaryService } from './cloudinary.service';

import { CloudinaryUploadSignatureDto } from './dto/responses/cloudinary-upload-signature.dto';

@ApiTags('Cloudinary')
@Controller('uploads')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService) { }

    @Get('signature/:folder')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Generate Cloudinary upload signature',
    })
    @ApiParam({
        name: 'folder',
        enum: CloudinaryFolder,
        description: 'Cloudinary upload folder',
    })
    async generateSignature(
        @Param('folder')
        folder: CloudinaryFolderType,
    ): Promise<CloudinaryUploadSignatureDto> {
        const validFolders = Object.values(CloudinaryFolder);

        if (!validFolders.includes(folder)) {
            throw new BadRequestException('Invalid upload folder');
        }

        return this.cloudinaryService.generateUploadSignature(folder);
    }
}
