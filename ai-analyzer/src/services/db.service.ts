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

// Create tables if they don't exist
const initDb = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      service VARCHAR(255),
      severity VARCHAR(50), -- e.g. low, medium, high, critical
      alert_name VARCHAR(255),
      summary TEXT,
      root_cause TEXT,
      suggested_fix TEXT,
      confidence INTEGER, -- 0-100 percentage
      status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, INVESTIGATING, RESOLVED
      duration VARCHAR(50)
    );
  `;
  try {
    await pool.query(query);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize database:', err);
  }
};

initDb();

export const saveIncident = async (incidentData: any) => {
  const query = `
    INSERT INTO incidents (service, severity, alert_name, summary, root_cause, suggested_fix, confidence, status, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *;
  `;
  const values = [
    incidentData.service,
    incidentData.severity || 'UNKNOWN',
    incidentData.alert_name,
    incidentData.summary,
    incidentData.root_cause,
    incidentData.suggested_fix,
    incidentData.confidence || 0,
    incidentData.status || 'OPEN'
  ];

  try {
    const res = await pool.query(query, values);
    return res.rows[0];
  } catch (err) {
    console.error('Error saving incident to DB:', err);
    throw err;
  }
};
