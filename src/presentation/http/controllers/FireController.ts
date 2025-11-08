import { Request, Response, NextFunction } from 'express';
import { ReportFireUseCase } from '@application/use-cases/fires/ReportFireUseCase';
import { GetFiresUseCase } from '@application/use-cases/fires/GetFiresUseCase';
import { successResponse } from '@shared/utils/response';
import { FireMapper } from '@application/mappers/FireMapper';

export class FireController {
  constructor(
    private readonly reportFireUseCase: ReportFireUseCase,
    private readonly getFiresUseCase: GetFiresUseCase
  ) {}

  async reportFire(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { location, severity, description, images, affectedAreaSqm } = req.body;

      const fire = await this.reportFireUseCase.execute({
        userId,
        location,
        severity,
        description,
        images,
        affectedAreaSqm
      });

      // ✅ Transform to DTO with all fields
      const fireDTO = FireMapper.toDTO(fire);

      res.status(201).json(successResponse(fireDTO, 'Fire reported successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getFires(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, severity, page, limit } = req.query;

      const result = await this.getFiresUseCase.execute({
        status: status as string,
        severity: severity as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });

      // ✅ Transform all fires to DTOs
      const firesDTO = FireMapper.toListDTO(result.items);

      res.json(
        successResponse({
          reports: firesDTO,
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
}
