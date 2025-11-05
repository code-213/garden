import { Request, Response, NextFunction } from 'express';
import { GetLeaderboardUseCase } from '@application/use-cases/leaderboard/GetLeaderboardUseCase';
import { successResponse } from '@shared/utils/response';

export class LeaderboardController {
  constructor(private readonly getLeaderboardUseCase: GetLeaderboardUseCase) {}

  async getLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { metric, period, limit } = req.query;

      const leaderboard = await this.getLeaderboardUseCase.execute({
        metric: (metric as any) || 'trees_planted',
        period: (period as any) || 'all_time',
        limit: limit ? parseInt(limit as string) : 100
      });

      res.json(
        successResponse({
          leaderboard,
          metric,
          period
        })
      );
    } catch (error) {
      next(error);
    }
  }
}
