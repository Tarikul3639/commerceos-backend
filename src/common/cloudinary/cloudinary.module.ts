import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service.js';
import { CloudinaryController } from './cloudinary.controller.js';
import { CloudinaryUploadGuard } from './cloudinary-upload.guard.js';

@Global()
@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryUploadGuard],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
