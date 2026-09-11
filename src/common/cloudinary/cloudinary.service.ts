import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { v2 as cloudinary } from 'cloudinary';

import { CloudinaryFolderType, ResourceType } from './cloudinary.types';
import { CloudinaryUploadSignatureDto } from './dto/responses/cloudinary-upload-signature.dto';

@Injectable()
export class CloudinaryService {
  private readonly rootFolder: string;
  private readonly cloudName: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;

  constructor(private readonly configService: ConfigService) {
    /**
     * Initialize Cloudinary configuration using environment variables.
     */
    this.cloudName = this.configService.getOrThrow<string>(
      'cloudinary.cloudName',
    );
    this.apiKey = this.configService.getOrThrow<string>('cloudinary.apiKey');
    this.apiSecret = this.configService.getOrThrow<string>(
      'cloudinary.apiSecret',
    );
    this.rootFolder = this.configService.getOrThrow<string>(
      'cloudinary.rootFolder',
    );

    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  /**
   * Generate a signed upload signature.
   *
   * The frontend uses this signature
   * to upload files directly to Cloudinary.
   */
  generateUploadSignature(folder: CloudinaryFolderType): CloudinaryUploadSignatureDto {
    const timestamp = Math.floor(Date.now() / 1000);
    const fullFolder = `${this.rootFolder}/${folder}`;
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: fullFolder,
      },
      this.apiSecret,
    );

    return {
      timestamp,
      signature,
      folder: fullFolder,
      cloudName: this.cloudName,
      apiKey: this.apiKey,
    };
  }

  /**
   * Delete a resource from Cloudinary.
   */
  async delete(
    publicId: string,
    resourceType: ResourceType = 'image',
  ): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
}
