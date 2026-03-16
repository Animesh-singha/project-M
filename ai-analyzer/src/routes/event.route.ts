import { FastifyInstance } from 'fastify';
import { getEvents, getEventsByService, getIncidentTimeline, getIncidentAnalysis } from '../services/event.service';

export const eventRoutes = async (server: FastifyInstance) => {
  server.get('/events', async (request, reply) => {
    return getEvents();
  });

  server.get('/events/:service', async (request: any, reply) => {
    return getEventsByService(request.params.service);
  });

  server.get('/incidents/:id/analyze', async (request: any, reply) => {
    return getIncidentAnalysis(request.params.id);
  });
};
