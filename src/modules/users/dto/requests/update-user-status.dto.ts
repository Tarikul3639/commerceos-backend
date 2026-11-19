import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '@/lib/prisma/client';

export const EditableUserStatus = [
  UserStatus.ACTIVE,
  UserStatus.INACTIVE,
  UserStatus.SUSPENDED,
] as const;

export class UpdateUserStatusDto {
  @IsIn(EditableUserStatus)
  @ApiProperty({
    description: 'The status of the user',
    enum: EditableUserStatus,
    example: UserStatus.ACTIVE,
  })
  status!: UserStatus;
}
