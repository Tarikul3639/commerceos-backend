import { PaginationMetaDto } from '../dto/responses/pagination-meta.dto.js';

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMetaDto;
}
