import { ITreeRepository } from '@domain/repositories/ITreeRepository';
import { IFireRepository } from '@domain/repositories/IFireRepository';
import { IUserRepository } from '@domain/repositories/IUserRepository';

export interface LeaderboardDTO {
  metric: 'trees_planted' | 'waterings' | 'fires_reported';
  period: 'week' | 'month' | 'all_time';
  limit?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  score: number;
  change: number;
}

export class GetLeaderboardUseCase {
  constructor(
    private readonly treeRepository: ITreeRepository,
    private readonly fireRepository: IFireRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: LeaderboardDTO): Promise<LeaderboardEntry[]> {
    // Implementation would aggregate data based on metric and period
    // This is a simplified version
    const limit = dto.limit || 100;

    // Query based on metric
    // Return ranked list
    
    // Placeholder implementation
    return [];
  }
}
