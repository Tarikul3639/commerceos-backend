import { PaginationMetaDto } from '../dto/responses/pagination-meta.dto';

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMetaDto;
}