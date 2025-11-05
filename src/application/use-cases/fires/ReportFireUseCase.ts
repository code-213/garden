import { IFireRepository } from '@domain/repositories/IFireRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Fire, FireProps, FireSeverity } from '@domain/entities/Fire';
import { Location } from '@domain/value-objects/Location';
import { UnauthorizedError, ValidationError } from '@shared/errors';

export interface ReportFireDTO {
  userId: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  severity: FireSeverity;
  description: string;
  images?: string[];
  affectedAreaSqm?: number;
}

export class ReportFireUseCase {
  constructor(
    private readonly fireRepository: IFireRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: ReportFireDTO): Promise<Fire> {
    // Verify user
    const user = await this.userRepository.findById(dto.userId);
    if (!user || !user.isActive()) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Validate inputs
    if (!dto.description || dto.description.trim().length < 10) {
      throw new ValidationError('Description must be at least 10 characters');
    }

    const location = Location.create(dto.location);

    const fireProps: FireProps = {
      reportedBy: dto.userId,
      location,
      severity: dto.severity,
      status: 'pending',
      description: dto.description.trim(),
      reportedDate: new Date(),
      updatedDate: new Date(),
      images: dto.images || [],
      affectedAreaSqm: dto.affectedAreaSqm
    };

    const fire = Fire.create(fireProps);

    return await this.fireRepository.save(fire);
  }
}
