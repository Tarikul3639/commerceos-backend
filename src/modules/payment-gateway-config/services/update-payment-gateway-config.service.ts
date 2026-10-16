import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma } from '@/lib/prisma/client';
import { UpdatePaymentGatewayConfigDto } from '../dto/requests/update-payment-gateway-config.dto';
import { PaymentGatewayConfigResponseDto } from '../dto/responses/payment-gateway-config-response.dto';

@Injectable()
export class UpdatePaymentGatewayConfigService {
    constructor(private readonly prisma: PrismaService) { }

    async execute(
        id: string,
        dto: UpdatePaymentGatewayConfigDto,
    ): Promise<PaymentGatewayConfigResponseDto> {
        const existing = await this.prisma.paymentGatewayConfig.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException(
                `Payment gateway configuration with ID ${id} not found`,
            );
        }

        if (dto.provider !== undefined && dto.provider !== existing.provider) {
            const providerExists = await this.prisma.paymentGatewayConfig.findUnique({
                where: { provider: dto.provider },
            });

            if (providerExists) {
                throw new ConflictException(
                    `Configuration for ${dto.provider} already exists`,
                );
            }
        }

        const data: Prisma.PaymentGatewayConfigUpdateInput = {
            ...(dto.provider !== undefined && {
                provider: dto.provider,
            }),
            ...(dto.displayName !== undefined && {
                displayName: dto.displayName,
            }),
            ...(dto.isEnabled !== undefined && {
                isEnabled: dto.isEnabled,
            }),
            ...(dto.mode !== undefined && {
                mode: dto.mode,
            }),
            ...(dto.settings !== undefined && {
                settings: dto.settings as Prisma.InputJsonValue,
            }),
        };

        const config = await this.prisma.paymentGatewayConfig.update({
            where: { id },
            data,
        });

        return {
            id: config.id,
            provider: config.provider,
            displayName: config.displayName,
            isEnabled: config.isEnabled,
            mode: config.mode,
            settings: config.settings as Record<string, unknown> | null,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }
}
