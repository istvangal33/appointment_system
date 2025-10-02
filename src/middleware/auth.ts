import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/jwt';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        errorCode: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    // Attach user info to request
    (request as any).user = payload;
  } catch (error) {
    return reply.status(401).send({
      errorCode: 'UNAUTHORIZED',
      message: error instanceof Error ? error.message : 'Invalid token',
    });
  }
}
