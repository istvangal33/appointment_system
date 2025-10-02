import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { companyScopeMiddleware } from '../middleware/companyScope';
import { CompanyScopedRequest } from '../types';

export async function companyRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /companies/current - Get current company details
  fastify.get(
    '/companies/current',
    { preHandler: [authMiddleware, companyScopeMiddleware] },
    async (request, reply) => {
      try {
        const { companyId, userRole } = request as any as CompanyScopedRequest;

        const company = await prisma.company.findUnique({
          where: { id: companyId },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            settings: true,
            createdAt: true,
          },
        });

        if (!company) {
          return reply.status(404).send({
            errorCode: 'COMPANY_NOT_FOUND',
            message: 'Company not found',
          });
        }

        return reply.send({
          ...company,
          userRole,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          errorCode: 'INTERNAL_ERROR',
          message: 'Failed to fetch company data',
        });
      }
    }
  );
}
