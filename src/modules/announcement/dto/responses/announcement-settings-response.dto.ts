import { ApiProperty } from '@nestjs/swagger';

export class AnnouncementSettingsResponseDto {
  @ApiProperty()
  message!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  updatedAt!: Date;
}
