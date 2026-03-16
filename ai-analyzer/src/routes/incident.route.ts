import { FastifyInstance } from 'fastify';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { getIncidentAnalytics } from '../services/analytics.service';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'incident_user',
  password: process.env.DB_PASSWORD || 'incident_pass',
  database: process.env.DB_NAME || 'incidents',
});

export const incidentRoutes = async (server: FastifyInstance) => {
  // Get all incidents
  server.get('/incidents', async (request, reply) => {
    try {
      const res = await pool.query('SELECT * FROM incidents ORDER BY timestamp DESC LIMIT 50');
      return res.rows;
    } catch (err) {
      server.log.error(err);
      return reply.code(500).send({ error: 'Failed to fetch incidents' });
    }
  });

  // Update incident status
  server.patch('/incidents/:id', async (request: any, reply) => {
    const { id } = request.params;
    const { status } = request.body;
    
    if (!['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
       return reply.code(400).send({ error: 'Invalid status' });
    }

    try {
      const res = await pool.query(
        'UPDATE incidents SET status = $1, last_updated = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );
      if (res.rows.length === 0) return reply.code(404).send({ error: 'Incident not found' });
      return res.rows[0];
    } catch (err) {
      server.log.error(err);
      return reply.code(500).send({ error: 'Failed to update incident' });
    }
  });

  // Get incident stats (SLA/MTTR/Frequency)
  server.get('/incidents/stats', async (request, reply) => {
     try {
        const analytics = await getIncidentAnalytics();
        return analytics;
     } catch (err) {
        return reply.code(500).send({ error: 'Failed to fetch stats' });
     }
  });
};
