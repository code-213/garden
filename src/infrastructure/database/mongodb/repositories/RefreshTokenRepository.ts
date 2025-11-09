import { IRefreshTokenRepository } from '@domain/repositories/IRefreshTokenRepository';
import { RefreshToken, RefreshTokenProps } from '@domain/entities/RefreshToken';
import { RefreshTokenModel, IRefreshTokenDocument } from '../models/RefreshTokenModel';
import { logger } from '@shared/utils/logger';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  async save(token: RefreshToken): Promise<RefreshToken> {
    const tokenData = this.toPersistence(token);
    const doc = new RefreshTokenModel(tokenData);
    await doc.save();
    return this.toDomain(doc);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const doc = await RefreshTokenModel.findOne({ token });
    return doc ? this.toDomain(doc) : null;
  }

  async findByFamilyId(familyId: string): Promise<RefreshToken[]> {
    const docs = await RefreshTokenModel.find({ familyId }).sort({ createdAt: -1 });
    return docs.map(doc => this.toDomain(doc));
  }

  async findActiveByUserId(userId: string): Promise<RefreshToken[]> {
    const docs = await RefreshTokenModel.find({
      userId,
      isUsed: false,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    return docs.map(doc => this.toDomain(doc));
  }

  async markAsUsed(token: string, replacedBy?: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { token },
      {
        $set: {
          isUsed: true,
          replacedBy,
          updatedAt: new Date()
        }
      }
    );
  }

  async revokeToken(token: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { token },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date()
        }
      }
    );
  }

  async revokeFamily(familyId: string): Promise<void> {
    logger.warn('🚨 Revoking entire token family', { familyId });

    const result = await RefreshTokenModel.updateMany(
      { familyId },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date()
        }
      }
    );

    logger.info(`Revoked ${result.modifiedCount} tokens in family ${familyId}`);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    logger.info('Revoking all tokens for user', { userId });

    const result = await RefreshTokenModel.updateMany(
      { userId },
      {
        $set: {
          isRevoked: true,
          updatedAt: new Date()
        }
      }
    );

    logger.info(`Revoked ${result.modifiedCount} tokens for user ${userId}`);
  }

  async deleteExpired(): Promise<number> {
    const result = await RefreshTokenModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });

    if (result.deletedCount && result.deletedCount > 0) {
      logger.info(`Deleted ${result.deletedCount} expired refresh tokens`);
    }

    return result.deletedCount || 0;
  }

  async updateReplacedBy(oldToken: string, newToken: string): Promise<void> {
    await RefreshTokenModel.updateOne(
      { token: oldToken },
      {
        $set: {
          replacedBy: newToken,
          updatedAt: new Date()
        }
      }
    );
  }

  private toDomain(doc: IRefreshTokenDocument): RefreshToken {
    const props: RefreshTokenProps = {
      token: doc.token,
      userId: doc.userId,
      familyId: doc.familyId,
      expiresAt: doc.expiresAt,
      isUsed: doc.isUsed,
      isRevoked: doc.isRevoked,
      replacedBy: doc.replacedBy,
      deviceInfo: doc.deviceInfo,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return RefreshToken.create(props, doc._id.toString());
  }

  private toPersistence(token: RefreshToken): any {
    return {
      _id: token.id,
      token: token.token,
      userId: token.userId,
      familyId: token.familyId,
      expiresAt: token.expiresAt,
      isUsed: token.isUsed,
      isRevoked: token.isRevoked,
      replacedBy: token.replacedBy,
      deviceInfo: token.deviceInfo,
      createdAt: token.createdAt,
      updatedAt: token.updatedAt
    };
  }
}
