import { Pool } from 'pg';

// For local testing on Windows without a DB, we gracefully catching connection errors
const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'incident_user',
  password: process.env.DB_PASSWORD || 'incident_pass',
  database: process.env.DB_NAME || 'incidents',
  connectionTimeoutMillis: 2000, 
};

let pool: Pool | null = null;
try {
  pool = new Pool(connectionConfig);
  // Suppress terminal spam on initial connect failure for local Dev UX
  pool.on('error', () => {}); 
} catch (e) {}

export async function fetchIncidents() {
  if (!pool) return [];
  try {
    const res = await pool.query('SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 50');
    return res.rows;
  } catch (error) {
    // Database isn't setup yet, return empty gracefully for frontend to render
    return [];
  }
}

export async function fetchStats() {
  if (!pool) return { total: 0, critical: 0, last24h: 0 };
  try {
    const totalRes = await pool.query('SELECT COUNT(*) as total FROM incidents');
    const criticalRes = await pool.query("SELECT COUNT(*) as critical FROM incidents WHERE severity = 'critical'");
    const avgDurationRes = await pool.query('SELECT COUNT(*) as count FROM incidents WHERE timestamp > NOW() - INTERVAL \'24 hours\''); 

    return {
      total: totalRes.rows[0].total,
      critical: criticalRes.rows[0].critical,
      last24h: avgDurationRes.rows[0].count,
    };
  } catch (error) {
    return { total: 0, critical: 0, last24h: 0 };
  }
}
