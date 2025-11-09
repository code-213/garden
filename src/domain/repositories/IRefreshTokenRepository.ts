// src/domain/repositories/IRefreshTokenRepository.ts
// CREATE NEW FILE

import { RefreshToken } from '../entities/RefreshToken';

export interface IRefreshTokenRepository {
  /**
   * Save a new refresh token
   */
  save(token: RefreshToken): Promise<RefreshToken>;

  /**
   * Find a refresh token by its token string
   */
  findByToken(token: string): Promise<RefreshToken | null>;

  /**
   * Find all tokens in a token family
   */
  findByFamilyId(familyId: string): Promise<RefreshToken[]>;

  /**
   * Find all active tokens for a user
   */
  findActiveByUserId(userId: string): Promise<RefreshToken[]>;

  /**
   * Mark a token as used
   */
  markAsUsed(token: string, replacedBy?: string): Promise<void>;

  /**
   * Revoke a specific token
   */
  revokeToken(token: string): Promise<void>;

  /**
   * Revoke all tokens in a family (when reuse is detected)
   */
  revokeFamily(familyId: string): Promise<void>;

  /**
   * Revoke all tokens for a user
   */
  revokeAllUserTokens(userId: string): Promise<void>;

  /**
   * Delete expired tokens (cleanup)
   */
  deleteExpired(): Promise<number>;

  /**
   * Update the replacedBy field
   */
  updateReplacedBy(oldToken: string, newToken: string): Promise<void>;
}
