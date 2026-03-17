import { FastifyInstance } from 'fastify';
import { saveAuthLog, getAuthLogs } from '../services/db.service';

export const authRoutes = async (server: FastifyInstance) => {
  server.post('/auth/log', async (request: any, reply) => {
    const { username, status } = request.body;
    const ip = request.ip;
    const userAgent = request.headers['user-agent'];

    if (!username || !status) {
      return reply.code(400).send({ error: 'Username and status are required' });
    }

    try {
      const log = await saveAuthLog({ username, ip, status, userAgent });
      return log;
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  });

  server.get('/auth/history', async (request, reply) => {
    try {
      const logs = await getAuthLogs(20);
      return logs;
    } catch (err: any) {
      server.log.error(err);
      return reply.code(500).send({ error: err.message });
    }
  });
};
