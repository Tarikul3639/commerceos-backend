import type { Prisma } from '../../../../infrastructure/database/generated/prisma/client.js';
import { BannerResponseDto } from './banner-response.dto.js';

export const bannerWithUsers = {
  createdBy: { select: { id: true, name: true, email: true } },
  updatedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.BannerInclude;

export type BannerWithUsers = Prisma.BannerGetPayload<{
  include: typeof bannerWithUsers;
}>;

export function toBannerResponse(banner: BannerWithUsers): BannerResponseDto {
  return {
    id: banner.id,
    title: banner.title,
    imageUrl: banner.imageUrl,
    imagePublicId: banner.imagePublicId,
    mobileImageUrl: banner.mobileImageUrl,
    mobileImagePublicId: banner.mobileImagePublicId,
    type: banner.type,
    position: banner.position,
    link: banner.link,
    openInNewTab: banner.openInNewTab,
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
    startAt: banner.startAt,
    endAt: banner.endAt,
    createdById: banner.createdById,
    updatedById: banner.updatedById,
    createdBy: banner.createdBy,
    updatedBy: banner.updatedBy,
    createdAt: banner.createdAt,
    updatedAt: banner.updatedAt,
  };
}
