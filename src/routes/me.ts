import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { UserTokenPayload, CompanyMembershipData } from '../types';

export async function meRoutes(fastify: FastifyInstance): Promise<void> {
  // GET /me - Get current user with company memberships
  fastify.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const user = (request as any).user as UserTokenPayload;

      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        include: {
          memberships: {
            include: {
              company: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      });

      if (!userData) {
        return reply.status(404).send({
          errorCode: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      const memberships: CompanyMembershipData[] = userData.memberships.map((membership) => ({
        companyId: membership.companyId,
        companyName: membership.company.name,
        companySlug: membership.company.slug,
        role: membership.role,
      }));

      return reply.send({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        memberships,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        errorCode: 'INTERNAL_ERROR',
        message: 'Failed to fetch user data',
      });
    }
  });
}
