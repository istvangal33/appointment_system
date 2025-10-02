import { CompanyRole } from '@prisma/client';

export interface UserTokenPayload {
  userId: string;
  email: string;
}

export interface CompanyMembershipData {
  companyId: string;
  companyName: string;
  companySlug: string;
  role: CompanyRole;
}

export interface AuthenticatedUser extends UserTokenPayload {
  memberships: CompanyMembershipData[];
}

export interface CompanyScopedRequest {
  user: UserTokenPayload;
  companyId: string;
  userRole: CompanyRole;
}
