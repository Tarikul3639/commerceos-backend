import { prisma } from './client';
import { BannerType, BannerPosition } from '@/lib/prisma/client';
import type { Prisma } from '@/lib/prisma/client';

const banners: Prisma.BannerCreateInput[] = [
    {
        id: 'seed-banner-summer-collection',
        title: 'Summer Collection 2026',
        imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        imagePublicId: 'seed/summer-collection-desktop',
        mobileImageUrl:
            'https://images.unsplash.com/photo-1483985988355-763728e1935b',
        mobileImagePublicId: 'seed/summer-collection-mobile',
        type: BannerType.PROMOTION,
        position: BannerPosition.HOME_TOP,
        link: '/collections/summer',
        buttonText: 'Shop Now',
        openInNewTab: false,
        sortOrder: 1,
        isActive: true,
        startAt: null,
        endAt: null,
    },
    {
        id: 'seed-banner-new-arrivals',
        title: 'New Arrivals',
        imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b',
        imagePublicId: 'seed/new-arrivals-desktop',
        mobileImageUrl: null,
        mobileImagePublicId: null,
        type: BannerType.PROMOTION,
        position: BannerPosition.HOME_MIDDLE,
        link: '/collections/new-arrivals',
        buttonText: 'Explore Collection',
        openInNewTab: false,
        sortOrder: 2,
        isActive: true,
        startAt: null,
        endAt: null,
    },
    {
        id: 'seed-banner-exclusive-deals',
        title: 'Exclusive Deals',
        imageUrl: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db',
        imagePublicId: 'seed/exclusive-deals-desktop',
        mobileImageUrl: null,
        mobileImagePublicId: null,
        type: BannerType.PROMOTION,
        position: BannerPosition.HOME_BOTTOM,
        link: '/collections/sale',
        buttonText: 'View Offers',
        openInNewTab: false,
        sortOrder: 3,
        isActive: true,
        startAt: null,
        endAt: null,
    },
    {
        id: 'seed-banner-discover-clothing',
        title: 'Discover Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
        imagePublicId: 'seed/discover-clothing-desktop',
        mobileImageUrl: null,
        mobileImagePublicId: null,
        type: BannerType.CATEGORY,
        position: BannerPosition.CATEGORY_TOP,
        link: '/categories/clothing',
        buttonText: 'Explore Now',
        openInNewTab: false,
        sortOrder: 1,
        isActive: true,
        startAt: null,
        endAt: null,
    },
    {
        id: 'seed-banner-coming-soon',
        title: 'Coming Soon',
        imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d',
        imagePublicId: 'seed/coming-soon-desktop',
        mobileImageUrl: null,
        mobileImagePublicId: null,
        type: BannerType.PROMOTION,
        position: BannerPosition.HOME_TOP,
        link: null,
        buttonText: null,
        openInNewTab: false,
        sortOrder: 4,
        isActive: false,
        startAt: null,
        endAt: null,
    },
];

export async function seedBanners() {
    console.log('Seeding banners...');

    for (const banner of banners) {
        if (!banner.id) {
            throw new Error('Banner seed requires an id');
        }

        const { id, ...data } = banner;

        await prisma.banner.upsert({
            where: { id },
            update: data,
            create: banner,
        });

        console.log(`  ✓ ${banner.title ?? id}`);
    }

    console.log(`Seeded ${banners.length} banners.`);
}
