// src/infrastructure/cache/TokenBlacklistService.ts
// CREATE NEW FILE

import { RedisCache } from './RedisCache';
import jwt from 'jsonwebtoken';
import { logger } from '@shared/utils/logger';

export interface ITokenBlacklistService {
  blacklistAccessToken(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
  blacklistAllUserTokens(userId: string): Promise<void>;
  clearExpired(): Promise<void>;
}

export class TokenBlacklistService implements ITokenBlacklistService {
  private readonly PREFIX = 'blacklist:token:';
  private readonly USER_PREFIX = 'blacklist:user:';

  constructor(private readonly cache: RedisCache) {}

  /**
   * Add an access token to the blacklist
   * TTL is calculated from token expiration
   */
  async blacklistAccessToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as any;

      if (!decoded || !decoded.exp) {
        logger.warn('Cannot blacklist token without expiration');
        return;
      }

      // Calculate TTL in seconds
      const expirationTime = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const ttl = Math.floor((expirationTime - now) / 1000);

      // Only blacklist if token hasn't expired
      if (ttl > 0) {
        await this.cache.set(`${this.PREFIX}${token}`, '1', ttl);
        logger.debug('Access token blacklisted', {
          ttl,
          userId: decoded.userId,
          tokenPrefix: token.substring(0, 20)
        });
      } else {
        logger.debug('Token already expired, not blacklisting');
      }
    } catch (error) {
      logger.error('Error blacklisting token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is blacklisted
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      // Check token-specific blacklist
      const tokenBlacklisted = await this.cache.get(`${this.PREFIX}${token}`);
      if (tokenBlacklisted) {
        return true;
      }

      // Check user-wide blacklist
      const decoded = jwt.decode(token) as any;
      if (decoded?.userId) {
        const userBlacklisted = await this.cache.get(`${this.USER_PREFIX}${decoded.userId}`);
        if (userBlacklisted) {
          const blacklistTime = parseInt(userBlacklisted);
          const tokenIssueTime = decoded.iat * 1000;

          // If token was issued before the user-wide blacklist, it's invalid
          if (tokenIssueTime < blacklistTime) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      logger.error('Error checking blacklist:', error);
      return false; // Fail open for availability
    }
  }

  /**
   * Blacklist all tokens for a user (for account compromise scenarios)
   * Stores the current timestamp - all tokens issued before this are invalid
   */
  async blacklistAllUserTokens(userId: string): Promise<void> {
    try {
      const timestamp = Date.now().toString();
      // Store for 7 days (longer than refresh token lifetime)
      const ttl = 7 * 24 * 60 * 60;

      await this.cache.set(`${this.USER_PREFIX}${userId}`, timestamp, ttl);

      logger.warn('All tokens blacklisted for user', { userId });
    } catch (error) {
      logger.error('Error blacklisting user tokens:', error);
      throw error;
    }
  }

  /**
   * Clear expired entries (handled automatically by Redis TTL, but useful for stats)
   */
  async clearExpired(): Promise<void> {
    logger.debug('Expired tokens are automatically removed by Redis TTL');
  }
}
