import { ApiProperty } from '@nestjs/swagger'

import { UserResponseDto } from './user-response.dto'
import { PaginationMetaDto } from '../../../../common/dto/responses/pagination-meta.dto'

export class UserListResponseDto {
    @ApiProperty({
        type: [UserResponseDto],
        description: 'List of users',
    })
    data!: UserResponseDto[]

    @ApiProperty({
        type: PaginationMetaDto,
    })
    meta!: PaginationMetaDto
}