import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/database/prisma.service.js';

@Injectable()
export class GetNavigationCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const categories = await this.prisma.category.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 8,
    });

    return {
      data: categories,
    };
  }
}
