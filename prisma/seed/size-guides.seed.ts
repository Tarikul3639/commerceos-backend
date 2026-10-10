import { Prisma } from '../../src/lib/prisma/client';
import { prisma } from './client';

const sizeGuides = [
    {
        name: 'Panjabi',
        description: "Men's panjabi size guide",
        unit: 'cm',
        columns: ['Size', 'Chest', 'Shoulder', 'Length', 'Sleeve'],
        rows: [
            { Size: 'S', Chest: 102, Shoulder: 43, Length: 102, Sleeve: 58 },
            { Size: 'M', Chest: 107, Shoulder: 45, Length: 104, Sleeve: 59 },
            { Size: 'L', Chest: 112, Shoulder: 47, Length: 107, Sleeve: 60 },
            { Size: 'XL', Chest: 117, Shoulder: 49, Length: 109, Sleeve: 61 },
            { Size: 'XXL', Chest: 122, Shoulder: 51, Length: 112, Sleeve: 62 },
        ],
    },
    {
        name: 'T-Shirt',
        description: 'Unisex T-shirt size guide',
        unit: 'cm',
        columns: ['Size', 'Chest', 'Shoulder', 'Length'],
        rows: [
            { Size: 'S', Chest: 92, Shoulder: 42, Length: 66 },
            { Size: 'M', Chest: 97, Shoulder: 44, Length: 69 },
            { Size: 'L', Chest: 102, Shoulder: 46, Length: 71 },
            { Size: 'XL', Chest: 107, Shoulder: 48, Length: 74 },
            { Size: 'XXL', Chest: 112, Shoulder: 50, Length: 76 },
        ],
    },
    {
        name: 'Pant',
        description: "Men's pant size guide",
        unit: 'cm',
        columns: ['Size', 'Waist', 'Hip', 'Length', 'Inseam'],
        rows: [
            { Size: 'S', Waist: 76, Hip: 96, Length: 99, Inseam: 74 },
            { Size: 'M', Waist: 81, Hip: 101, Length: 101, Inseam: 76 },
            { Size: 'L', Waist: 86, Hip: 106, Length: 102, Inseam: 77 },
            { Size: 'XL', Waist: 91, Hip: 111, Length: 104, Inseam: 79 },
            { Size: 'XXL', Waist: 96, Hip: 116, Length: 105, Inseam: 80 },
        ],
    },
    {
        name: 'Shoes',
        description: 'Footwear size guide',
        unit: 'cm',
        columns: ['EU Size', 'Foot Length'],
        rows: [
            { 'EU Size': '39', 'Foot Length': 24.5 },
            { 'EU Size': '40', 'Foot Length': 25.0 },
            { 'EU Size': '41', 'Foot Length': 25.5 },
            { 'EU Size': '42', 'Foot Length': 26.5 },
            { 'EU Size': '43', 'Foot Length': 27.0 },
            { 'EU Size': '44', 'Foot Length': 28.0 },
        ],
    },
] as const;

export async function seedSizeGuides() {
    console.log('Seeding size guides...');

    for (const guide of sizeGuides) {
        const data = {
            name: guide.name,
            description: guide.description,
            unit: guide.unit,
            columns: guide.columns as unknown as Prisma.InputJsonValue,
            rows: guide.rows as unknown as Prisma.InputJsonValue,
        };

        const existing = await prisma.sizeGuide.findFirst({
            where: { name: guide.name },
            select: { id: true },
        });

        if (existing) {
            await prisma.sizeGuide.update({
                where: { id: existing.id },
                data,
            });
        } else {
            await prisma.sizeGuide.create({ data });
        }

        console.log(`  ✓ ${guide.name}`);
    }

    console.log('Size guides seeded.');
}
