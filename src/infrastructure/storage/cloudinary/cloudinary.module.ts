import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from './services/cloudinary.service.js';
import { CloudinaryController } from './controllers/cloudinary.controller.js';
import { CloudinaryUploadGuard } from './guards/cloudinary-upload.guard.js';

@Global()
@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService, CloudinaryUploadGuard],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
