// src/app.ts
// UPDATE THIS FILE - Add new dependencies

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from '@config/env.config';
import { setupRoutes } from '@presentation/http/routes';
import { errorHandler } from '@presentation/http/middlewares/error.middleware';
import { globalRateLimit } from '@presentation/http/middlewares/rateLimit.middleware';
import { logger } from '@shared/utils/logger';

// Import controllers
import { AuthController } from '@presentation/http/controllers/AuthController';
import { TreeController } from '@presentation/http/controllers/TreeController';
import { FireController } from '@presentation/http/controllers/FireController';
import { UserController } from '@presentation/http/controllers/UserController';

// Import repositories
import { UserRepository } from '@infrastructure/database/mongodb/repositories/UserRepository';
import { TreeRepository } from '@infrastructure/database/mongodb/repositories/TreeRepository';
import { FireRepository } from '@infrastructure/database/mongodb/repositories/FireRepository';
import { RefreshTokenRepository } from '@infrastructure/database/mongodb/repositories/RefreshTokenRepository';
import { CommentRepository } from '@infrastructure/database/mongodb/repositories/CommentRepository';

// Import services
import { JwtService } from '@infrastructure/auth/JwtService';
import { RedisCache } from '@infrastructure/cache/RedisCache';
import { TokenBlacklistService } from '@infrastructure/cache/TokenBlacklistService';

// Import use cases
import { GoogleLoginUseCase } from '@application/use-cases/auth/GoogleLoginUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { PlantTreeUseCase } from '@application/use-cases/trees/PlantTreeUseCase';
import { WaterTreeUseCase } from '@application/use-cases/trees/WaterTreeUseCase';
import { GetTreesUseCase } from '@application/use-cases/trees/GetTreesUseCase';
import { ReportFireUseCase } from '@application/use-cases/fires/ReportFireUseCase';
import { GetFiresUseCase } from '@application/use-cases/fires/GetFiresUseCase';
import { GetUserProfileUseCase } from '@application/use-cases/users/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '@application/use-cases/users/UpdateUserProfileUseCase';
import { GetLeaderboardUseCase } from '@application/use-cases/leaderboard/GetLeaderboardUseCase';
import { LeaderboardController } from '@presentation/http/controllers/LeaderboardController';
import { GetUserStatsUseCase } from '@application/use-cases/users/GetUserStatsUseCase';
import { CommentController } from '@presentation/http/controllers/CommentController';

import {
  createAuthMiddleware,
  setAuthMiddleware
} from '@presentation/http/middlewares/auth.middleware';

export function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(config.cors));

  // Body parser
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Rate limiting
  app.use(globalRateLimit);

  // Request logging
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    next();
  });

  // Initialize repositories
  const userRepository = new UserRepository();
  const treeRepository = new TreeRepository();
  const fireRepository = new FireRepository();
  const refreshTokenRepository = new RefreshTokenRepository();
  const commentRepository = new CommentRepository();

  // Initialize cache and services
  const redisCache = new RedisCache();
  const blacklistService = new TokenBlacklistService(redisCache);
  const jwtService = new JwtService(refreshTokenRepository, userRepository);

  // Setup auth middleware with all dependencies
  const authMiddleware = createAuthMiddleware(jwtService, userRepository, blacklistService);
  setAuthMiddleware(authMiddleware);

  // Initialize auth use cases
  const googleLoginUseCase = new GoogleLoginUseCase(userRepository, jwtService);
  const refreshTokenUseCase = new RefreshTokenUseCase(jwtService);
  const registerUseCase = new RegisterUseCase(userRepository, jwtService);
  const loginUseCase = new LoginUseCase(userRepository, jwtService);
  const logoutUseCase = new LogoutUseCase(refreshTokenRepository, blacklistService);

  // Initialize other use cases
  const plantTreeUseCase = new PlantTreeUseCase(treeRepository, userRepository);
  const waterTreeUseCase = new WaterTreeUseCase(treeRepository);
  const getTreesUseCase = new GetTreesUseCase(treeRepository);
  const reportFireUseCase = new ReportFireUseCase(fireRepository, userRepository);
  const getFiresUseCase = new GetFiresUseCase(fireRepository);
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
  const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
  const getUserStatsUseCase = new GetUserStatsUseCase(
    userRepository,
    treeRepository,
    fireRepository
  );
  const getLeaderboardUseCase = new GetLeaderboardUseCase(
    treeRepository,
    fireRepository,
    userRepository
  );

  // Initialize controllers
  const authController = new AuthController(
    googleLoginUseCase,
    refreshTokenUseCase,
    registerUseCase,
    loginUseCase,
    logoutUseCase
  );
  const treeController = new TreeController(plantTreeUseCase, waterTreeUseCase, getTreesUseCase);
  const fireController = new FireController(reportFireUseCase, getFiresUseCase);
  const userController = new UserController(
    getUserProfileUseCase,
    updateUserProfileUseCase,
    getUserStatsUseCase
  );
  const leaderboardController = new LeaderboardController(getLeaderboardUseCase);
  const commentController = new CommentController(commentRepository);

  // Setup routes
  setupRoutes(app, {
    auth: authController,
    tree: treeController,
    fire: fireController,
    user: userController,
    leaderboard: leaderboardController,
    comment: commentController
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
