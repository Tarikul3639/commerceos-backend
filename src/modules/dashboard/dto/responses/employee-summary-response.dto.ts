import { ApiProperty } from '@nestjs/swagger';

export class EmployeeSummaryResponseDto {
    @ApiProperty({
        example: 45,
    })
    totalEmployees!: number;

    @ApiProperty({
        example: 42,
    })
    activeEmployees!: number;

    @ApiProperty({
        example: 3,
    })
    newEmployees!: number;
}