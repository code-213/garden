import { Request, Response, NextFunction } from 'express';
import { PlantTreeUseCase } from '@application/use-cases/trees/PlantTreeUseCase';
import { WaterTreeUseCase } from '@application/use-cases/trees/WaterTreeUseCase';
import { GetTreesUseCase } from '@application/use-cases/trees/GetTreesUseCase';
import { successResponse } from '@shared/utils/response';
import { TreeMapper } from '@application/mappers/TreeMapper';

export class TreeController {
  constructor(
    private readonly plantTreeUseCase: PlantTreeUseCase,
    private readonly waterTreeUseCase: WaterTreeUseCase,
    private readonly getTreesUseCase: GetTreesUseCase
  ) {}

  async plantTree(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { species, location, image, notes } = req.body;

      const tree = await this.plantTreeUseCase.execute({
        userId,
        species,
        location,
        image,
        notes
      });

      // ✅ Transform to DTO
      const treeDTO = TreeMapper.toDTO(tree);

      res.status(201).json(successResponse(treeDTO, 'Tree planted successfully'));
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

      // ✅ Transform all trees to DTOs
      const treesDTO = TreeMapper.toListDTO(result.items);

      res.json(
        successResponse({
          trees: treesDTO,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            total_pages: result.totalPages
          }
        })
      );
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

      // ✅ Use camelCase (not snake_case)
      res.json(
        successResponse(
          {
            id: tree.id,
            waterCount: tree.waterCount,
            lastWatered: tree.lastWatered?.toISOString() || null,
            status: tree.status
          },
          'Tree watered successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
