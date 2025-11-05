import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';
import { authMiddleware } from '../middlewares/auth.middleware';

export function createLeaderboardRoutes(leaderboardController: LeaderboardController): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get('/', leaderboardController.getLeaderboard.bind(leaderboardController));

  return router;
}
