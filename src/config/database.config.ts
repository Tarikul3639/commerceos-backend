import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  connectionString: process.env.PRISMA_DATABASE_URL,
}));
