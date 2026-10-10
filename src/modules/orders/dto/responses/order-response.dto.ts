import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/* ============================================================================
 * DTO: OrderItemResponseDto
 * ============================================================================ */

export class OrderItemResponseDto {
  @ApiProperty({
    example: 'clx123orderitem',
  })
  id!: string;

  @ApiProperty({
    example: 2,
  })
  quantity!: number;

  @ApiProperty({
    example: '1200.00',
  })
  unitPrice!: string;

  @ApiProperty({
    example: '2400.00',
  })
  subtotal!: string;

  @ApiProperty({
    example: 'clx123product',
  })
  productId!: string;

  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clx123product' },
      name: { type: 'string', example: 'Classic Cotton T-Shirt' },
    },
  })
  product!: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({
    nullable: true,
    example: 'clx123variant',
  })
  variantId!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'TSHIRT-RED-M',
  })
  variantSku!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'Red',
  })
  variantColor!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    example: 'M',
  })
  variantSize!: string | null;

  @ApiProperty({
    example: '2026-10-10T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-10-10T10:30:00.000Z',
  })
  updatedAt!: Date;
}

/* ============================================================================
 * DTO: OrderCustomerResponseDto
 * ============================================================================ */

export class OrderCustomerResponseDto {
  @ApiProperty({
    example: 'clx123customer',
  })
  id!: string;

  @ApiProperty({
    example: 'John Doe',
  })
  name!: string;
}

/* ============================================================================
 * DTO: OrderUserResponseDto
 * ============================================================================ */

export class OrderUserResponseDto {
  @ApiProperty({
    example: 'clx123user',
  })
  id!: string;

  @ApiProperty({
    example: 'Admin User',
  })
  name!: string;

  @ApiProperty({
    example: 'admin@example.com',
  })
  email!: string;
}

/* ============================================================================
 * DTO: OrderResponseDto
 * ============================================================================ */

export class OrderResponseDto {
  @ApiProperty({
    example: 'clx123order',
  })
  id!: string;

  @ApiProperty({
    example: 'INV-2026-0001',
  })
  invoiceNo!: string;

  @ApiProperty({
    example: '2400.00',
  })
  subtotal!: string;

  @ApiProperty({
    example: '200.00',
  })
  discount!: string;

  @ApiProperty({
    example: '120.00',
  })
  tax!: string;

  @ApiProperty({
    example: '2320.00',
  })
  total!: string;

  @ApiProperty({
    example: 'PAID',
  })
  paymentStatus!: string;

  @ApiProperty({
    example: 'PROCESSING',
  })
  status!: string;

  @ApiProperty({
    type: OrderCustomerResponseDto,
  })
  customer!: OrderCustomerResponseDto;

  @ApiProperty({
    type: OrderUserResponseDto,
  })
  user!: OrderUserResponseDto;

  @ApiProperty({
    type: [OrderItemResponseDto],
  })
  items!: OrderItemResponseDto[];

  @ApiProperty({
    example: '2026-10-10T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-10-10T10:30:00.000Z',
  })
  updatedAt!: Date;
}
