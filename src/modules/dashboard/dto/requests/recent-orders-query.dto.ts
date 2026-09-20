import { Type } from "class-transformer"
import { IsInt, IsOptional, Max, Min } from "class-validator"
import { ApiPropertyOptional } from "@nestjs/swagger"

export class RecentOrdersQueryDto {
    @ApiPropertyOptional({
        default: 10,
        minimum: 1,
        maximum: 20,
        description: "Maximum number of recent orders to return",
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(20)
    limit?: number
}
