import * as dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

const mode = process.env.NODE_ENV || 'development';

const envFile = `.env.${mode}.local`;

dotenv.config({
  path: envFile,
});

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
  },
});
