import { Pool } from 'pg';

// Singleton pattern para conexión a BD en entorno Serverless
let pool: Pool;

if (!global.pool) {
  global.pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Necesario para Supabase transaction mode
    },
    max: 10, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

pool = global.pool;

// Extender el tipo global para TypeScript
declare global {
  var pool: Pool | undefined;
}

export default pool;
