import { Request, Response, NextFunction } from 'express';
import { UpdateFireStatusUseCase } from '@application/use-cases/fires/UpdateFireStatusUseCase';
import { successResponse } from '@shared/utils/response';

export class AdminController {
  constructor(private readonly updateFireStatusUseCase: UpdateFireStatusUseCase) {}

  async updateFireStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fireId } = req.params;
      const { status, notes } = req.body;
      const userId = req.user!.id;
      const isAdmin = req.user!.role === 'admin';

      await this.updateFireStatusUseCase.execute({
        fireId,
        newStatus: status,
        notes,
        userId,
        isAdmin
      });

      res.json(successResponse(null, 'Fire status updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Implementation would aggregate system-wide statistics
      const stats = {
        totalUsers: 0,
        totalTrees: 0,
        totalFires: 0,
        activeUsers: 0
      };

      res.json(successResponse(stats));
    } catch (error) {
      next(error);
    }
  }
}
