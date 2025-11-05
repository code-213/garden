import { Request, Response, NextFunction } from 'express';
import { GetUserProfileUseCase } from '@application/use-cases/users/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@application/use-cases/users/UpdateUserProfileUseCase';
import { successResponse } from '@shared/utils/response';

export class UserController {
  constructor(
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}

  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const user = await this.getUserProfileUseCase.execute(userId);

      res.json(successResponse({
        id: user.id,
        name: user.name,
        email: user.email.getValue(),
        bio: user.bio,
        avatar: user.avatar,
        location: user.location,
        joined_date: user.createdAt
      }));
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

      res.json(successResponse({
        id: user.id,
        name: user.name,
        bio: user.bio,
        location: user.location,
        avatar: user.avatar
      }, 'Profile updated successfully'));
    } catch (error) {
      next(error);
    }
  }
}
