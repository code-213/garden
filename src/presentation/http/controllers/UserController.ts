import { Request, Response, NextFunction } from 'express';
import { GetUserProfileUseCase } from '@application/use-cases/users/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@application/use-cases/users/UpdateUserProfileUseCase';
import { successResponse } from '@shared/utils/response';
import { UserMapper } from '@application/mappers/UserMapper';
import { GetUserStatsUseCase } from '@application/use-cases/users/GetUserStatsUseCase';

export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase,
    private readonly getUserStatsUseCase: GetUserStatsUseCase // ✅ Add
  ) {}

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await this.getUserProfileUseCase.execute(userId);

      // ✅ Include role and status
      const userDTO = UserMapper.toDTO(user);

      res.json(successResponse(userDTO));
    } catch (error) {
      next(error);
    }
  }

  async getUserStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const stats = await this.getUserStatsUseCase.execute({ userId });

      res.json(
        successResponse({
          trees_planted: stats.treesPlanted,
          total_waterings: stats.totalWaterings,
          fires_reported: stats.firesReported,
          joined_date: stats.joinedDate.toISOString(),
          rank: stats.rank
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const requesterId = req.user!.id;
      const { name, bio, location, avatar } = req.body;

      const user = await this.updateUserProfileUseCase.execute({
        userId,
        requesterId,
        name,
        bio,
        location,
        avatar
      });

      // ✅ Return full user DTO
      const userDTO = UserMapper.toDTO(user);

      res.json(successResponse(userDTO, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
