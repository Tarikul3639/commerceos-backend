import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OmitType } from '@nestjs/swagger';

import { CreateUserDto } from './create-user.dto.js';
import { Role } from '../../../../infrastructure/database/generated/prisma/enums.js';

export const StaffRole = [Role.MANAGER, Role.EMPLOYEE] as const;

export class CreateEmployeeDto extends OmitType(CreateUserDto, [
  'role',
] as const) {
  @IsEnum(StaffRole)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Staff role',
    enum: StaffRole,
    example: Role.EMPLOYEE,
  })
  role!: (typeof StaffRole)[number];
}
