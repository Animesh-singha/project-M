import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { processIncident } from '../services/incident.service';

export const webhookRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  server.post('/webhook', async (request, reply) => {
    try {
      const payload = request.body as any;
      
      server.log.info(`Received webhook from Alertmanager. Status: ${payload.status}`);
      
      if (payload.status === 'resolved') {
        server.log.info('Alert is resolved, skipping AI analysis.');
        return { message: 'Acknowledged resolved alert' };
      }

      // Process each alert (often grouped by Alertmanager)
      if (payload.alerts && payload.alerts.length > 0) {
        // Fire and forget so we don't block Alertmanager
        processIncident(payload.alerts, server.log).catch(err => {
          server.log.error('Error processing incident inline:', err);
        });
      }

      return { status: 'processing' };
    } catch (error) {
      server.log.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
