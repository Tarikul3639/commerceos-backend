import { Global, Module } from '@nestjs/common';
import { CloudinaryService } from '@/common/cloudinary/cloudinary.service';
import { CloudinaryController } from '@/common/cloudinary/cloudinary.controller';

@Global()
@Module({
  controllers: [CloudinaryController],
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
