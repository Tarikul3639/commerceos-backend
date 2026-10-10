import { prisma } from './client';

const brands = [
    { name: 'Nike', slug: 'nike', website: 'https://www.nike.com' },
    { name: 'Adidas', slug: 'adidas', website: 'https://www.adidas.com' },
    { name: 'Puma', slug: 'puma', website: 'https://www.puma.com' },
    { name: 'Reebok', slug: 'reebok', website: 'https://www.reebok.com' },
    {
        name: 'New Balance',
        slug: 'new-balance',
        website: 'https://www.newbalance.com',
    },
    { name: 'Converse', slug: 'converse', website: 'https://www.converse.com' },
    { name: 'Vans', slug: 'vans', website: 'https://www.vans.com' },
    { name: "Levi's", slug: 'levis', website: 'https://www.levi.com' },
    { name: 'Zara', slug: 'zara', website: 'https://www.zara.com' },
    { name: 'H&M', slug: 'hm', website: 'https://www.hm.com' },
    { name: 'Uniqlo', slug: 'uniqlo', website: 'https://www.uniqlo.com' },
    { name: 'Gucci', slug: 'gucci', website: 'https://www.gucci.com' },
    { name: 'Prada', slug: 'prada', website: 'https://www.prada.com' },
    {
        name: 'Louis Vuitton',
        slug: 'louis-vuitton',
        website: 'https://www.louisvuitton.com',
    },
    {
        name: 'Tommy Hilfiger',
        slug: 'tommy-hilfiger',
        website: 'https://www.tommy.com',
    },
    {
        name: 'Calvin Klein',
        slug: 'calvin-klein',
        website: 'https://www.calvinklein.com',
    },
    { name: 'Lacoste', slug: 'lacoste', website: 'https://www.lacoste.com' },
    {
        name: 'Under Armour',
        slug: 'under-armour',
        website: 'https://www.underarmour.com',
    },
    { name: 'ASICS', slug: 'asics', website: 'https://www.asics.com' },
    { name: 'FILA', slug: 'fila', website: 'https://www.fila.com' },
] as const;

export async function seedBrands() {
    console.log('Seeding brands...');

    for (const brand of brands) {
        await prisma.brand.upsert({
            where: { slug: brand.slug },
            update: {
                name: brand.name,
                website: brand.website,
            },
            create: {
                ...brand,
                description: null,
                image: null,
                publicId: null,
            },
        });

        console.log(`  ✓ ${brand.name}`);
    }

    console.log(`Seeded ${brands.length} brands.`);
}
