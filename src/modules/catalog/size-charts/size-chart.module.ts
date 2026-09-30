import { Module } from '@nestjs/common';
import { SizeChartController } from './controllers/size-chart.controller';
import { CreateSizeChartService } from './services/create-size-chart.service';
import { DeleteSizeChartService } from './services/delete-size-chart.service';
import { GetSizeChartService } from './services/get-size-chart.service';
import { GetSizeChartsService } from './services/get-size-charts.service';
import { UpdateSizeChartService } from './services/update-size-chart.service';

@Module({
    controllers: [SizeChartController],
    providers: [
        CreateSizeChartService,
        DeleteSizeChartService,
        GetSizeChartService,
        GetSizeChartsService,
        UpdateSizeChartService,
    ],
})
export class SizeChartModule {}