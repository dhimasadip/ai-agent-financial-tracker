import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import { db as envDb } from '@/lib/env';

// Database instance - initialized lazily
let _db: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!_db) {
    if (!envDb.url) {
      throw new Error('Database not configured. Set DATABASE_URL or DATABASE_TEST environment variable.');
    }
    const sql = neon(envDb.url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export { schema };
export type Database = ReturnType<typeof drizzle<typeof schema>>;

// Wrapper that delegates to the actual drizzle instance
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    return (...args: any[]) => {
      const instance = getDb();
      const fn = (instance as any)[prop];
      if (typeof fn === 'function') {
        return fn.apply(instance, args);
      }
      return fn;
    };
  },
});