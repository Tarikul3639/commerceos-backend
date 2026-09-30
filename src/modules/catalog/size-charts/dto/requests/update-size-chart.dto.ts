import { PartialType } from '@nestjs/swagger';
import { CreateSizeChartDto } from './create-size-chart.dto';

export class UpdateSizeChartDto extends PartialType(CreateSizeChartDto) {}