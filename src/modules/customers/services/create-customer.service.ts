import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../../infrastructure/database/prisma.service.js';
import { CreateActivityLogService } from '../../activity-logs/services/create-activity-log.service.js';
import {
  ActivityModule,
  ActivityType,
} from '../../../infrastructure/database/generated/prisma/client.js';
import { generateRandomHashPassword } from '../../../common/utils/password.util.js';
import { CreateCustomerDto } from '../dto/requests/create-customer.dto.js';

@Injectable()
export class CreateCustomerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,

    private readonly createActivityLogService: CreateActivityLogService,
  ) {}

  async execute(createCustomerDto: CreateCustomerDto, userId: string) {
    const { name, email, phone, avatarUrl, publicId, address } =
      createCustomerDto;

    if ((avatarUrl !== undefined) !== (publicId !== undefined)) {
      throw new BadRequestException(
        'Avatar URL and Cloudinary public ID must be provided together',
      );
    }

    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        OR: [{ email }, ...(phone !== undefined ? [{ phone }] : [])],
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });

    if (existingCustomer) {
      if (existingCustomer.email === email) {
        throw new ConflictException('Email already exists');
      }

      if (phone !== undefined && existingCustomer.phone === phone) {
        throw new ConflictException('Phone number already exists');
      }
    }

    const hashedPassword = await generateRandomHashPassword(
      12,
      this.configService.getOrThrow<number>('bcrypt.saltRounds'),
    );

    const customer = await this.prisma.$transaction(async (tx) => {
      const created = await tx.customer.create({
        data: {
          name,
          email,
          ...(phone !== undefined && { phone }),
          password: hashedPassword,
          ...(address !== undefined && { address }),
          ...(avatarUrl !== undefined && { avatarUrl }),
          ...(publicId !== undefined && { publicId }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          publicId: true,
          address: true,
          status: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await this.createActivityLogService.execute(
        {
          type: ActivityType.CREATE,
          module: ActivityModule.CUSTOMER,
          action: 'CREATE_CUSTOMER',
          entityType: 'Customer',
          entityId: created.id,
          userId,
          newValue: { id: created.id },
        },
        tx,
      );
      return created;
    });

    return customer;
  }
}
