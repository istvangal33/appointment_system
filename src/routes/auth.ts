import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { comparePassword } from '../lib/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /auth/login
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);

      const user = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (!user) {
        return reply.status(401).send({
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const isPasswordValid = await comparePassword(body.password, user.password);

      if (!isPasswordValid) {
        return reply.status(401).send({
          errorCode: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        });
      }

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
      });

      // Set refresh token as HTTPOnly cookie
      reply.setCookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
        path: '/',
      });

      return reply.send({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          errorCode: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          errors: error.errors,
        });
      }

      fastify.log.error(error);
      return reply.status(500).send({
        errorCode: 'INTERNAL_ERROR',
        message: 'An error occurred during login',
      });
    }
  });

  // POST /auth/refresh
  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return reply.status(401).send({
          errorCode: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token not found',
        });
      }

      // TODO: Implement refresh token rotation for better security
      const payload = verifyRefreshToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        return reply.status(401).send({
          errorCode: 'INVALID_USER',
          message: 'User not found',
        });
      }

      const newAccessToken = signAccessToken({
        userId: user.id,
        email: user.email,
      });

      return reply.send({
        accessToken: newAccessToken,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(401).send({
        errorCode: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid or expired refresh token',
      });
    }
  });

  // POST /auth/logout
  fastify.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('refreshToken', {
      path: '/',
    });

    return reply.send({
      message: 'Logged out successfully',
    });
  });
}
