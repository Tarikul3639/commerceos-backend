import { prisma } from './client';

const categories = [
    {
        name: "Men's Clothing",
        slug: 'mens-clothing',
        description: 'Clothing and apparel for men.',
    },
    {
        name: "Women's Clothing",
        slug: 'womens-clothing',
        description: 'Clothing and apparel for women.',
    },
    {
        name: "Kids' Clothing",
        slug: 'kids-clothing',
        description: 'Clothing for kids and children.',
    },
    {
        name: 'Panjabi',
        slug: 'panjabi',
        description: 'Traditional panjabi and ethnic wear.',
    },
    {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Casual and printed t-shirts.',
    },
    {
        name: 'Shirts',
        slug: 'shirts',
        description: 'Formal and casual shirts.',
    },
    {
        name: 'Pants & Trousers',
        slug: 'pants-trousers',
        description: 'Pants, trousers and bottoms.',
    },
    {
        name: 'Jeans',
        slug: 'jeans',
        description: 'Denim jeans and denim bottoms.',
    },
    {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Casual, formal and sports footwear.',
    },
    {
        name: 'Sandals & Slippers',
        slug: 'sandals-slippers',
        description: 'Sandals, slippers and everyday footwear.',
    },
    {
        name: 'Bags & Backpacks',
        slug: 'bags-backpacks',
        description: 'Bags, backpacks and travel bags.',
    },
    {
        name: 'Watches',
        slug: 'watches',
        description: 'Wristwatches and fashion watches.',
    },
    {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Fashion and everyday accessories.',
    },
    {
        name: 'Beauty & Personal Care',
        slug: 'beauty-personal-care',
        description: 'Beauty, skincare and personal care products.',
    },
    {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic devices and gadgets.',
    },
    {
        name: 'Mobile Phones',
        slug: 'mobile-phones',
        description: 'Mobile phones and smartphones.',
    },
    {
        name: 'Computers & Laptops',
        slug: 'computers-laptops',
        description: 'Computers, laptops and related devices.',
    },
    {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Home essentials and living products.',
    },
    {
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
        description: 'Sports equipment and fitness products.',
    },
    {
        name: 'Books & Stationery',
        slug: 'books-stationery',
        description: 'Books, notebooks and stationery items.',
    },
] as const;

export async function seedCategories() {
    console.log('Seeding categories...');

    for (const category of categories) {
        await prisma.category.upsert({
            where: { slug: category.slug },
            update: {
                name: category.name,
                description: category.description,
            },
            create: category,
        });

        console.log(`  ✓ ${category.name}`);
    }

    console.log(`Seeded ${categories.length} categories.`);
}
