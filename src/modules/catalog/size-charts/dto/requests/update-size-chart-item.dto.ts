import { PartialType } from '@nestjs/swagger';
import { CreateSizeChartItemDto } from './create-size-chart-item.dto';

export class UpdateSizeChartItemDto extends PartialType(CreateSizeChartItemDto) {}