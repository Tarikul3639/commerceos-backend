import { ApiProperty } from '@nestjs/swagger';

export class SearchResultDto {
  @ApiProperty() id!: string;
  @ApiProperty() title!: string;
  @ApiProperty() category!: string;
  @ApiProperty() description!: string;
  @ApiProperty() href!: string;
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchResultDto] })
  data!: SearchResultDto[];
}
