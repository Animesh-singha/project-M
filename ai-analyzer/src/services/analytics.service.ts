import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'incident_user',
  password: process.env.DB_PASSWORD || 'incident_pass',
  database: process.env.DB_NAME || 'incidents',
});

export const getIncidentAnalytics = async () => {
  try {
    // 1. Calculate MTTR (Mean Time to Resolve) in minutes
    // We assume duration is stored or we calculate from timestamp -> last_updated
    const mttrRes = await pool.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (last_updated - timestamp))/60) as avg_mttr_minutes
      FROM incidents 
      WHERE status = 'RESOLVED'
    `);

    // 2. Incident Frequency per Service
    const frequencyRes = await pool.query(`
      SELECT service, COUNT(*) as incident_count
      FROM incidents
      GROUP BY service
      ORDER BY incident_count DESC
    `);

    // 3. Security Threat Distribution
    const securityRes = await pool.query(`
      SELECT alert_name, COUNT(*) as count
      FROM incidents
      WHERE alert_name LIKE '%SECURITY%' OR severity = 'CRITICAL'
      GROUP BY alert_name
    `);

    return {
      mttr: parseFloat(mttrRes.rows[0].avg_mttr_minutes || '0').toFixed(1),
      frequency: frequencyRes.rows,
      security_summary: securityRes.rows
    };
  } catch (err) {
    console.error('Failed to fetch analytics:', err);
    return { mttr: 0, frequency: [], security_summary: [] };
  }
};
