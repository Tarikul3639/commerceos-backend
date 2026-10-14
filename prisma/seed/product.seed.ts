import { Prisma, ProductStatus } from "../../src/lib/prisma/client"
import { prisma } from "./client"

const productSeeds = [
    {
        name: 'Premium Cotton Panjabi',
        subDescription: 'Premium cotton fabric for a refined look',
        description:
            'Comfortable cotton panjabi for everyday wear and special occasions.',
        purchasePrice: 850,
        sellingPrice: 1290,
        status: ProductStatus.PUBLISHED,
        category: 'Panjabi',
        sizeGuide: 'Panjabi',
        images: ['panjabi-front', 'panjabi-back'],
    },
    {
        name: 'Classic White Panjabi',
        subDescription: 'Classic white panjabi with a clean design',
        description:
            'A versatile white panjabi suitable for celebrations and formal gatherings.',
        purchasePrice: 900,
        sellingPrice: 1390,
        status: ProductStatus.PUBLISHED,
        category: 'Panjabi',
        sizeGuide: 'Panjabi',
        images: ['white-panjabi'],
    },
    {
        name: 'Embroidered Festive Panjabi',
        subDescription: 'Elegant embroidery with a festive finish',
        description:
            'A festive panjabi designed for cultural events and special occasions.',
        purchasePrice: 1250,
        sellingPrice: 1890,
        status: ProductStatus.PROPOSED,
        category: 'Panjabi',
        sizeGuide: 'Panjabi',
        images: ['embroidered-panjabi'],
    },
    {
        name: 'Classic Cotton T-Shirt',
        subDescription: 'Soft cotton for everyday comfort',
        description: 'A regular-fit cotton T-shirt for casual daily wear.',
        purchasePrice: 250,
        sellingPrice: 450,
        status: ProductStatus.PUBLISHED,
        category: 'T-Shirt',
        sizeGuide: 'T-Shirt',
        images: ['classic-tshirt-front', 'classic-tshirt-back'],
    },
    {
        name: 'Black Essential T-Shirt',
        subDescription: 'Minimal black everyday essential',
        description:
            'A versatile black T-shirt that pairs easily with casual outfits.',
        purchasePrice: 280,
        sellingPrice: 490,
        status: ProductStatus.PUBLISHED,
        category: 'T-Shirt',
        sizeGuide: 'T-Shirt',
        images: ['black-tshirt'],
    },
    {
        name: 'Oversized Graphic T-Shirt',
        subDescription: 'Relaxed fit with a modern graphic',
        description:
            'An oversized graphic T-shirt for contemporary casual styling.',
        purchasePrice: 350,
        sellingPrice: 650,
        status: ProductStatus.DRAFT,
        category: 'T-Shirt',
        sizeGuide: 'T-Shirt',
        images: ['graphic-tshirt'],
    },
    {
        name: 'Classic Polo Shirt',
        subDescription: 'Smart casual regular-fit polo',
        description: 'A classic polo shirt for casual outings and everyday use.',
        purchasePrice: 400,
        sellingPrice: 690,
        status: ProductStatus.PUBLISHED,
        category: 'T-Shirt',
        sizeGuide: 'T-Shirt',
        images: ['polo-shirt'],
    },
    {
        name: 'Slim Fit Denim Pant',
        subDescription: 'Modern slim-fit denim',
        description: 'A versatile denim pant for casual and smart-casual outfits.',
        purchasePrice: 650,
        sellingPrice: 990,
        status: ProductStatus.PUBLISHED,
        category: 'Pant',
        sizeGuide: 'Pant',
        images: ['denim-pant-front', 'denim-pant-back'],
    },
    {
        name: 'Regular Fit Chino Pant',
        subDescription: 'Comfortable chino for daily wear',
        description:
            'A regular-fit chino pant suitable for work and casual occasions.',
        purchasePrice: 700,
        sellingPrice: 1090,
        status: ProductStatus.PUBLISHED,
        category: 'Pant',
        sizeGuide: 'Pant',
        images: ['chino-pant'],
    },
    {
        name: 'Black Formal Pant',
        subDescription: 'Clean tailoring for formal outfits',
        description:
            'A classic black formal pant designed for office and formal wear.',
        purchasePrice: 800,
        sellingPrice: 1250,
        status: ProductStatus.PROPOSED,
        category: 'Pant',
        sizeGuide: 'Pant',
        images: ['formal-pant'],
    },
    {
        name: 'Casual Sneakers',
        subDescription: 'Lightweight everyday sneakers',
        description:
            'Comfortable sneakers for daily activities and casual styling.',
        purchasePrice: 1100,
        sellingPrice: 1590,
        status: ProductStatus.PUBLISHED,
        category: 'Shoes',
        sizeGuide: 'Shoes',
        images: ['casual-sneakers'],
    },
    {
        name: 'Classic White Sneakers',
        subDescription: 'Minimal white sneaker design',
        description:
            'White sneakers designed to complement everyday casual outfits.',
        purchasePrice: 1200,
        sellingPrice: 1790,
        status: ProductStatus.PUBLISHED,
        category: 'Shoes',
        sizeGuide: 'Shoes',
        images: ['white-sneakers'],
    },
    {
        name: 'Running Sports Shoes',
        subDescription: 'Sport-inspired lightweight footwear',
        description:
            'Lightweight sports shoes for everyday movement and active lifestyles.',
        purchasePrice: 1450,
        sellingPrice: 2190,
        status: ProductStatus.DRAFT,
        category: 'Shoes',
        sizeGuide: 'Shoes',
        images: ['running-shoes'],
    },
    {
        name: 'Leather Casual Shoes',
        subDescription: 'Smart casual leather-style footwear',
        description:
            'Casual shoes suited to smart-casual outfits and everyday occasions.',
        purchasePrice: 1800,
        sellingPrice: 2690,
        status: ProductStatus.PUBLISHED,
        category: 'Shoes',
        sizeGuide: 'Shoes',
        images: ['leather-casual-shoes'],
    },
    {
        name: 'Printed Casual Shirt',
        subDescription: 'Contemporary all-over print',
        description:
            'A printed casual shirt for relaxed outings and everyday styling.',
        purchasePrice: 550,
        sellingPrice: 890,
        status: ProductStatus.PUBLISHED,
        category: 'Shirt',
        sizeGuide: 'Shirt',
        images: ['printed-shirt'],
    },
    {
        name: 'Oxford Formal Shirt',
        subDescription: 'Classic button-down formal shirt',
        description:
            'An Oxford-style shirt suitable for office and smart-casual outfits.',
        purchasePrice: 650,
        sellingPrice: 1050,
        status: ProductStatus.PROPOSED,
        category: 'Shirt',
        sizeGuide: 'Shirt',
        images: ['oxford-shirt'],
    },
    {
        name: 'Linen Casual Shirt',
        subDescription: 'Lightweight fabric for warm weather',
        description:
            'A lightweight casual shirt designed for comfortable warm-weather wear.',
        purchasePrice: 750,
        sellingPrice: 1190,
        status: ProductStatus.PUBLISHED,
        category: 'Shirt',
        sizeGuide: 'Shirt',
        images: ['linen-shirt'],
    },
    {
        name: 'Everyday Cotton Shorts',
        subDescription: 'Relaxed fit cotton shorts',
        description:
            'Comfortable cotton shorts for home, travel and casual outings.',
        purchasePrice: 300,
        sellingPrice: 550,
        status: ProductStatus.DRAFT,
        category: 'Shorts',
        sizeGuide: 'Shorts',
        images: ['cotton-shorts'],
    },
    {
        name: 'Cargo Utility Pants',
        subDescription: 'Functional pockets with a relaxed fit',
        description: 'Utility-inspired cargo pants for casual everyday styling.',
        purchasePrice: 850,
        sellingPrice: 1290,
        status: ProductStatus.PUBLISHED,
        category: 'Pant',
        sizeGuide: 'Pant',
        images: ['cargo-pants'],
    },
    {
        name: 'Premium Casual Hoodie',
        subDescription: 'Soft fabric with a relaxed silhouette',
        description:
            'A casual hoodie suitable for cooler weather and relaxed outfits.',
        purchasePrice: 900,
        sellingPrice: 1490,
        status: ProductStatus.REJECTED,
        category: 'Hoodie',
        sizeGuide: 'Hoodie',
        images: ['casual-hoodie'],
    },
];

/** Seed products and images without requiring unique product names. */
export async function seedProducts(): Promise<void> {
    const [categories, brands, sizeGuides] = await Promise.all([
        prisma.category.findMany({
            select: { id: true, name: true },
        }),
        prisma.brand.findMany({
            select: { id: true, name: true },
        }),
        prisma.sizeGuide.findMany({
            select: { id: true, name: true },
        }),
    ]);

    const categoryMap = new Map(
        categories.map((item) => [item.name.toLowerCase(), item.id]),
    );

    const sizeGuideMap = new Map(
        sizeGuides.map((item) => [item.name.toLowerCase(), item.id]),
    );

    const brandId = brands[0]?.id;
    let createdCount = 0;

    for (const [index, seed] of productSeeds.entries()) {
        const categoryId = categoryMap.get(seed.category.toLowerCase());

        if (!categoryId) {
            console.warn(
                `Skipping "${seed.name}": category "${seed.category}" not found.`,
            );
            continue;
        }

        const existingProduct = await prisma.product.findFirst({
            where: { name: seed.name },
            select: { id: true },
        });

        const productData = {
            name: seed.name,
            subDescription: seed.subDescription,
            description: seed.description,
            purchasePrice: new Prisma.Decimal(seed.purchasePrice),
            sellingPrice: new Prisma.Decimal(seed.sellingPrice),
            status: seed.status,
            categoryId,
            ...(brandId ? { brandId } : {}),
            ...(sizeGuideMap.get(seed.sizeGuide.toLowerCase())
                ? { sizeGuideId: sizeGuideMap.get(seed.sizeGuide.toLowerCase())! }
                : {}),
        };

        if (existingProduct) {
            await prisma.product.update({
                where: { id: existingProduct.id },
                data: productData,
            });
            continue;
        }

        await prisma.product.create({
            data: {
                ...productData,
                images: {
                    create: seed.images.map((imageName, imageIndex) => ({
                        imageUrl: `https://placehold.co/800x1000?text=${encodeURIComponent(imageName)}`,
                        publicId: `commerceos-seed-product-${index + 1}-${imageIndex + 1}`,
                        sortOrder: imageIndex,
                    })),
                },
            },
        });

        createdCount++;
    }

    console.log(`Product seed completed. Created ${createdCount} products.`);
}