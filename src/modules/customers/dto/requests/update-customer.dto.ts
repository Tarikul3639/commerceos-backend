import { PartialType } from '@nestjs/swagger';
import { CreateCustomerDto } from '@/modules/customers/dto/requests/create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
