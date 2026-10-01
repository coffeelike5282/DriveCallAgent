export type MembershipTier = 'FREE' | 'DAY_PASS' | 'PRO';

export interface UserProfile {
  id: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  membershipTier: MembershipTier;
  passExpiresAt?: string | null; // ISO string
  createdAt: string;
  updatedAt: string;
}
