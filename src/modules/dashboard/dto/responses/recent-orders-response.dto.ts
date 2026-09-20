import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class RecentOrderCustomerDto {
    @ApiProperty()
    id!: string

    @ApiProperty()
    name!: string

    // Customers do not currently have an image field in the Prisma schema.
    @ApiPropertyOptional({
        description: "Customer image or avatar when available",
        nullable: true,
    })
    image?: string | null
}

export class RecentOrderItemDto {
    @ApiProperty()
    id!: string

    @ApiProperty()
    orderNumber!: string

    @ApiProperty({ type: () => RecentOrderCustomerDto })
    customer!: RecentOrderCustomerDto

    @ApiProperty({ example: "1250.00" })
    total!: string

    @ApiProperty()
    status!: string

    @ApiPropertyOptional()
    paymentStatus?: string

    @ApiProperty()
    createdAt!: Date
}
