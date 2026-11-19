import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../lib/prisma/client.js';
import type { Discount } from '../../../lib/prisma/client.js';
import { PrismaService } from '../../../common/prisma/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import { ActivityModule, ActivityType } from '../../../lib/prisma/client.js';
import { CreateDiscountDto } from '../dto/requests/create-discount.dto.js';
import { UpdateDiscountDto } from '../dto/requests/update-discount.dto.js';
import { DiscountQueryDto } from '../dto/requests/discount-query.dto.js';
import { DiscountListResponseDto } from '../dto/responses/discount-list-response.dto.js';
import { DiscountResponseDto } from '../dto/responses/discount-response.dto.js';

@Injectable()
export class DiscountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  private validateRules(input: {
    type?: string;
    value?: number;
    maxDiscountAmount?: number | null;
    startsAt?: Date | null;
    endsAt?: Date | null;
  }) {
    if (
      input.type === 'PERCENTAGE' &&
      input.value !== undefined &&
      input.value > 100
    ) {
      throw new BadRequestException('Percentage discount cannot exceed 100');
    }
    if (input.type === 'FIXED' && input.maxDiscountAmount != null) {
      throw new BadRequestException(
        'Maximum discount cap is only valid for percentage discounts',
      );
    }
    if (input.startsAt && input.endsAt && input.startsAt >= input.endsAt) {
      throw new BadRequestException('End date must be after start date');
    }
  }

  private toResponse(discount: Discount): DiscountResponseDto {
    return {
      id: discount.id,
      code: discount.code,
      description: discount.description,
      type: discount.type,
      value: discount.value.toString(),
      minOrderAmount: discount.minOrderAmount.toString(),
      maxDiscountAmount: discount.maxDiscountAmount?.toString() ?? null,
      startsAt: discount.startsAt,
      endsAt: discount.endsAt,
      usageLimit: discount.usageLimit,
      isActive: discount.isActive,
      createdById: discount.createdById,
      updatedById: discount.updatedById,
      createdAt: discount.createdAt,
      updatedAt: discount.updatedAt,
    };
  }

  async list(query: DiscountQueryDto): Promise<DiscountListResponseDto> {
    const page = Math.max(Number(query.page ?? 1) || 1, 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 10) || 10, 1), 100);
    const where: Prisma.DiscountWhereInput = {
      ...(query.search?.trim()
        ? {
            OR: [
              { code: { contains: query.search.trim(), mode: 'insensitive' } },
              {
                description: {
                  contains: query.search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };
    const [rows, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.discount.count({ where }),
    ]);
    return {
      data: rows.map((row) => this.toResponse(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async get(id: string): Promise<DiscountResponseDto> {
    const row = await this.prisma.discount.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Discount not found');
    return this.toResponse(row);
  }

  async create(
    userId: string,
    dto: CreateDiscountDto,
  ): Promise<DiscountResponseDto> {
    this.validateRules(dto);
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const created = await tx.discount.create({
          data: {
            code: dto.code,
            description: dto.description?.trim() || null,
            type: dto.type,
            value: new Prisma.Decimal(dto.value),
            minOrderAmount: new Prisma.Decimal(dto.minOrderAmount ?? 0),
            maxDiscountAmount:
              dto.maxDiscountAmount == null
                ? null
                : new Prisma.Decimal(dto.maxDiscountAmount),
            startsAt: dto.startsAt ?? null,
            endsAt: dto.endsAt ?? null,
            usageLimit: dto.usageLimit ?? null,
            isActive: dto.isActive ?? true,
            createdById: userId,
            updatedById: userId,
          },
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.CREATE,
            module: ActivityModule.DISCOUNT,
            action: 'CREATE_DISCOUNT',
            description: 'Discount created',
            entityType: 'Discount',
            entityId: created.id,
            userId,
            newValue: {
              code: created.code,
              description: created.description,
              type: created.type,
              value: created.value.toString(),
              minOrderAmount: created.minOrderAmount.toString(),
              maxDiscountAmount: created.maxDiscountAmount?.toString() ?? null,
              startsAt: created.startsAt,
              endsAt: created.endsAt,
              usageLimit: created.usageLimit,
              isActive: created.isActive,
            },
          },
          tx,
        );
        return created;
      });
      return this.toResponse(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A discount with this code already exists');
      }
      throw error;
    }
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    try {
      const row = await this.prisma.$transaction(async (tx) => {
        const existing = await tx.discount.findUnique({ where: { id } });
        if (!existing) throw new NotFoundException('Discount not found');

        const type = dto.type ?? existing.type;
        const value = dto.value ?? Number(existing.value);
        const maxDiscountAmount =
          dto.maxDiscountAmount === undefined
            ? (existing.maxDiscountAmount?.toNumber() ?? null)
            : dto.maxDiscountAmount;
        const startsAt =
          dto.startsAt === undefined ? existing.startsAt : dto.startsAt;
        const endsAt = dto.endsAt === undefined ? existing.endsAt : dto.endsAt;
        this.validateRules({
          type,
          value,
          maxDiscountAmount,
          startsAt,
          endsAt,
        });

        const updated = await tx.discount.update({
          where: { id },
          data: {
            ...(dto.code !== undefined ? { code: dto.code } : {}),
            ...(dto.description !== undefined
              ? { description: dto.description?.trim() || null }
              : {}),
            ...(dto.type !== undefined ? { type: dto.type } : {}),
            ...(dto.value !== undefined
              ? { value: new Prisma.Decimal(dto.value) }
              : {}),
            ...(dto.minOrderAmount !== undefined
              ? { minOrderAmount: new Prisma.Decimal(dto.minOrderAmount) }
              : {}),
            ...(dto.maxDiscountAmount !== undefined
              ? {
                  maxDiscountAmount:
                    dto.maxDiscountAmount == null
                      ? null
                      : new Prisma.Decimal(dto.maxDiscountAmount),
                }
              : {}),
            ...(dto.startsAt !== undefined ? { startsAt: dto.startsAt } : {}),
            ...(dto.endsAt !== undefined ? { endsAt: dto.endsAt } : {}),
            ...(dto.usageLimit !== undefined
              ? { usageLimit: dto.usageLimit }
              : {}),
            ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
            updatedById: userId,
          },
        });

        const snapshot = (discount: Discount) => ({
          code: discount.code,
          description: discount.description,
          type: discount.type,
          value: discount.value.toString(),
          minOrderAmount: discount.minOrderAmount.toString(),
          maxDiscountAmount: discount.maxDiscountAmount?.toString() ?? null,
          startsAt: discount.startsAt,
          endsAt: discount.endsAt,
          usageLimit: discount.usageLimit,
          isActive: discount.isActive,
        });

        await this.createActivityLogService.execute(
          {
            type: ActivityType.UPDATE,
            module: ActivityModule.DISCOUNT,
            action: 'UPDATE_DISCOUNT',
            description: 'Discount updated',
            entityType: 'Discount',
            entityId: updated.id,
            userId,
            oldValue: snapshot(existing),
            newValue: snapshot(updated),
          },
          tx,
        );
        return updated;
      });
      return this.toResponse(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A discount with this code already exists');
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<void> {
    const existing = await this.prisma.discount.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Discount not found');
    await this.prisma.$transaction(async (tx) => {
      await tx.discount.delete({ where: { id } });
      await this.createActivityLogService.execute(
        {
          type: ActivityType.DELETE,
          module: ActivityModule.DISCOUNT,
          action: 'DELETE_DISCOUNT',
          entityType: 'Discount',
          entityId: id,
          userId,
          oldValue: {
            code: existing.code,
            type: existing.type,
            value: existing.value.toString(),
            isActive: existing.isActive,
          },
        },
        tx,
      );
    });
  }
}
