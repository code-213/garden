import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ITreeRepository } from '@domain/repositories/ITreeRepository';
import { IFireRepository } from '@domain/repositories/IFireRepository';

export interface UserStatsDTO {
  userId: string;
}

export interface UserStatsResult {
  treesPlanted: number;
  totalWaterings: number;
  firesReported: number;
  joinedDate: Date;
  rank: number;
}

export class GetUserStatsUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly treeRepository: ITreeRepository,
    private readonly fireRepository: IFireRepository
  ) {}

  async execute(dto: UserStatsDTO): Promise<UserStatsResult> {
    const user = await this.userRepository.findById(dto.userId);
    if (!user) throw new Error('User not found');

    const trees = await this.treeRepository.findByUserId(dto.userId);
    const treesPlanted = trees.length;
    const totalWaterings = trees.reduce((sum, tree) => sum + tree.waterCount, 0);
    const firesReported = await this.fireRepository.countByUserId(dto.userId);

    return {
      treesPlanted,
      totalWaterings,
      firesReported,
      joinedDate: user.createdAt,
      rank: 0 // Would need leaderboard implementation
    };
  }
}
