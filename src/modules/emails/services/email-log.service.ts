import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../../infrastructure/database/generated/prisma/client.js';
import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { EmailLogQueryDto } from '../dto/requests/email-log-query.dto.js';
import { EmailLogResponseDto } from '../dto/responses/email-log-response.dto.js';

@Injectable()
export class EmailLogService {
  constructor(private readonly prisma: PrismaService) {}

  private toResponse(log: {
    id: string;
    to: string;
    subject: string;
    body: string;
    status: EmailLogResponseDto['status'];
    attemptCount: number;
    sentAt: Date | null;
    entityType: string | null;
    entityId: string | null;
    triggeredById: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): EmailLogResponseDto {
    return {
      id: log.id,
      to: log.to,
      subject: log.subject,
      preview: log.body,
      status: log.status,
      attemptCount: log.attemptCount,
      sentAt: log.sentAt,
      entityType: log.entityType,
      entityId: log.entityId,
      triggeredById: log.triggeredById,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    };
  }

  async findAll(query: EmailLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();
    const where: Prisma.EmailLogWhereInput = {
      ...(query.status && { status: query.status }),
      ...((query.fromDate || query.toDate) && {
        createdAt: {
          ...(query.fromDate && { gte: new Date(query.fromDate) }),
          ...(query.toDate && { lte: new Date(query.toDate) }),
        },
      }),
      ...(search && {
        OR: [
          { to: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { entityType: { contains: search, mode: 'insensitive' } },
          { entityId: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.emailLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.emailLog.count({ where }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data: logs.map((log) => this.toResponse(log)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<EmailLogResponseDto> {
    const log = await this.prisma.emailLog.findUnique({ where: { id } });
    if (!log) throw new NotFoundException('Email log not found');
    return this.toResponse(log);
  }
}
