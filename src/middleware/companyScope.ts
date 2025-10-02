import { FastifyRequest, FastifyReply } from 'fastify';
import prisma from '../lib/prisma';
import { UserTokenPayload } from '../types';

export async function companyScopeMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const user = (request as any).user as UserTokenPayload;
    
    if (!user) {
      return reply.status(401).send({
        errorCode: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    // Get company ID from header or query param
    const companyId =
      request.headers['x-company-id'] as string ||
      (request.query as any).companyId as string;

    if (!companyId) {
      return reply.status(400).send({
        errorCode: 'MISSING_COMPANY_ID',
        message: 'Company ID is required (X-Company-ID header or companyId query param)',
      });
    }

    // Validate user membership
    // TODO: Add mem cache for performance
    const membership = await prisma.companyMembership.findUnique({
      where: {
        userId_companyId: {
          userId: user.userId,
          companyId: companyId,
        },
      },
    });

    if (!membership) {
      return reply.status(403).send({
        errorCode: 'NOT_COMPANY_MEMBER',
        message: 'User is not a member of this company',
      });
    }

    // Attach company context to request
    (request as any).companyId = companyId;
    (request as any).userRole = membership.role;
  } catch (error) {
    return reply.status(500).send({
      errorCode: 'INTERNAL_ERROR',
      message: 'Failed to validate company scope',
    });
  }
}
