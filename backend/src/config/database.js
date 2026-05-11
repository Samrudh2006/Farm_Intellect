import { PrismaClient } from '@prisma/client';
import { appEnv, getScopedEnv } from './environment.js';

const scopedDatabaseUrl = getScopedEnv('DATABASE_URL', {
  allowLegacyFallback: !['staging', 'production'].includes(appEnv),
});

if (!scopedDatabaseUrl && ['staging', 'production'].includes(appEnv)) {
  throw new Error(`Missing DATABASE_URL_${appEnv.toUpperCase()} for ${appEnv} environment.`);
}

const prisma = new PrismaClient({
  ...(scopedDatabaseUrl ? { datasources: { db: { url: scopedDatabaseUrl } } } : {}),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
