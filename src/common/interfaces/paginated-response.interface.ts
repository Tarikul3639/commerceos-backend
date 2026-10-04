import { PaginationMetaDto } from '@/common/dto/responses/pagination-meta.dto';

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
}
