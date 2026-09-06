import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes';
import { db } from './server/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Production must never silently start with missing database configuration.
  if (isProduction) {
    const required = ['DB_HOST', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD', 'ADMIN_JWT_SECRET', 'USER_AUTH_SECRET'];
    const missing = required.filter((key) => !process.env[key]?.trim());
    if (missing.length > 0) {
      throw new Error(`[TapEmpire] FATAL: Missing required production environment variables: ${missing.join(', ')}`);
    }
  }

  // Initialize MySQL database connection. A production database failure is fatal.
  try {
    await db.init();
    console.log('[TapEmpire] MySQL database engine initialized successfully.');
  } catch (err: any) {
    console.error('[TapEmpire] Database connection error on startup:', err.message);
    if (isProduction) {
      process.exitCode = 1;
      throw err;
    }
  }

  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: true, limit: '256kb' }));

  app.get('/api/health', async (_req, res) => {
    let dbStatus = 'disconnected';
    let latencyMs = 0;
    try {
      const start = Date.now();
      const pool = db.getPool();
      await pool.query('SELECT 1');
      latencyMs = Date.now() - start;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = `error: ${err.message}`;
    }

    res.status(dbStatus === 'connected' ? 200 : 503).json({
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      database_latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
      service: 'TapEmpire Telegram Tap-to-Earn Backend Engine',
    });
  });

  app.use('/api', apiRouter);

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[TapEmpire] Full-stack Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[TapEmpire] Fatal startup error:', err);
  process.exit(1);
});
