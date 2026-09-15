import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmployeeUser{
    @ApiProperty()
    id!: string;

    @ApiPropertyOptional()
    name!: string | null;

    @ApiProperty()
    email!: string;
}

export class EmployeeResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    designation!: string;

    @ApiPropertyOptional()
    salary!: string | null;

    @ApiProperty()
    joiningDate!: Date;

    @ApiProperty()
    userId!: string;

    @ApiPropertyOptional()
    user!: EmployeeUser | null;

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;
}