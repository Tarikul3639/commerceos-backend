import { prisma } from './client';

const suppliers = [
  {
    id: 'seed-supplier-1',
    name: 'Rahim Trading Company',
    email: 'rahim.trading@example.com',
    phone: '+8801700000001',
    address: 'Chawkbazar, Dhaka, Bangladesh',
    contactPerson: 'Abdul Rahim',
    isActive: true,
  },
  {
    id: 'seed-supplier-2',
    name: 'Karim Enterprise',
    email: 'karim.enterprise@example.com',
    phone: '+8801700000002',
    address: 'Narayanganj, Bangladesh',
    contactPerson: 'Mohammad Karim',
    isActive: true,
  },
  {
    id: 'seed-supplier-3',
    name: 'Dhaka Wholesale Mart',
    email: 'dhaka.wholesale@example.com',
    phone: '+8801700000003',
    address: 'Islampur, Dhaka, Bangladesh',
    contactPerson: 'Hasan Ali',
    isActive: true,
  },
  {
    id: 'seed-supplier-4',
    name: 'Fashion Source BD',
    email: 'fashion.source@example.com',
    phone: '+8801700000004',
    address: 'Mirpur, Dhaka, Bangladesh',
    contactPerson: 'Sabbir Hossain',
    isActive: true,
  },
  {
    id: 'seed-supplier-5',
    name: 'Global Import Traders',
    email: 'global.import@example.com',
    phone: '+8801700000005',
    address: 'Agrabad, Chattogram, Bangladesh',
    contactPerson: 'Mahmud Hasan',
    isActive: true,
  },
  {
    id: 'seed-supplier-6',
    name: 'Premium Textile Suppliers',
    email: 'premium.textile@example.com',
    phone: '+8801700000006',
    address: 'Gazipur, Bangladesh',
    contactPerson: 'Shahidul Islam',
    isActive: true,
  },
  {
    id: 'seed-supplier-7',
    name: 'Smart Packaging Solutions',
    email: 'smart.packaging@example.com',
    phone: '+8801700000007',
    address: 'Uttara, Dhaka, Bangladesh',
    contactPerson: 'Nusrat Jahan',
    isActive: true,
  },
  {
    id: 'seed-supplier-8',
    name: 'Electro Parts BD',
    email: 'electro.parts@example.com',
    phone: '+8801700000008',
    address: 'Nawabpur, Dhaka, Bangladesh',
    contactPerson: 'Tanvir Ahmed',
    isActive: true,
  },
  {
    id: 'seed-supplier-9',
    name: 'Reliable General Suppliers',
    email: 'reliable.suppliers@example.com',
    phone: '+8801700000009',
    address: 'Cumilla, Bangladesh',
    contactPerson: 'Imran Hossain',
    isActive: true,
  },
  {
    id: 'seed-supplier-10',
    name: 'Eastern Commercial Supply',
    email: 'eastern.commercial@example.com',
    phone: '+8801700000010',
    address: 'Sylhet, Bangladesh',
    contactPerson: 'Fahim Ahmed',
    isActive: false,
  },
];

export async function seedSuppliers() {
  console.log('Seeding suppliers...');

  for (const supplier of suppliers) {
    const { id, ...data } = supplier;

    await prisma.supplier.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
      },
    });
  }

  console.log(`Seeded ${suppliers.length} suppliers successfully.`);
}
