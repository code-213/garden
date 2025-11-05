import { Request, Response, NextFunction } from 'express';
import { PlantTreeUseCase } from '@application/use-cases/trees/PlantTreeUseCase';
import { WaterTreeUseCase } from '@application/use-cases/trees/WaterTreeUseCase';
import { GetTreesUseCase } from '@application/use-cases/trees/GetTreesUseCase';
import { successResponse } from '@shared/utils/response';

export class TreeController {
  constructor(
    private readonly plantTreeUseCase: PlantTreeUseCase,
    private readonly waterTreeUseCase: WaterTreeUseCase,
    private readonly getTreesUseCase: GetTreesUseCase
  ) {}

  async plantTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id; // From auth middleware
      const { species, location, image, notes } = req.body;

      const tree = await this.plantTreeUseCase.execute({
        userId,
        species,
        location,
        image,
        notes
      });

      res.status(201).json(successResponse(tree, 'Tree planted successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getTrees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user_id, species, status, page, limit } = req.query;

      const result = await this.getTreesUseCase.execute({
        userId: user_id as string,
        species: species as string,
        status: status as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      res.json(successResponse({
        trees: result.items,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          total_pages: result.totalPages
        }
      }));
    } catch (error) {
      next(error);
    }
  }

  async waterTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { treeId } = req.params;
      const { notes } = req.body;

      const tree = await this.waterTreeUseCase.execute({
        treeId,
        userId,
        notes
      });

      res.json(successResponse({
        tree_id: tree.id,
        water_count: tree.waterCount,
        last_watered: tree.lastWatered,
        status: tree.status
      }, 'Tree watered successfully'));
    } catch (error) {
      next(error);
    }
  }
}
