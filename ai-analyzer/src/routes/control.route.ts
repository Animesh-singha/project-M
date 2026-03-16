import { FastifyInstance } from 'fastify';
import { executeServerAction } from '../services/control.service';

export const controlRoutes = async (server: FastifyInstance) => {
  server.post('/control/execute', async (request: any, reply) => {
    const { target, action } = request.body;

    if (!target || !action) {
      return reply.code(400).send({ error: 'Target and action are required' });
    }

    try {
      const result = await executeServerAction(target, action);
      return result;
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  });

  server.get('/control/history', async (request, reply) => {
    // In production, we'd fetch this from DB (audit logs)
    return [
      { id: 1, target: 'vps-nyc-02', action: 'RESTART_NODE', timestamp: new Date().toISOString(), status: 'SUCCESS' }
    ];
  });
};
