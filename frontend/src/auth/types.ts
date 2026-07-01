export type PremiumStatus = 'free' | 'safe' | 'premium' | 'expired' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  premiumStatus: PremiumStatus;
  createdAt: string;
}
