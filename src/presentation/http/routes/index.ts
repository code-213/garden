import { Router, Application, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TreeController } from '../controllers/TreeController';
import { FireController } from '../controllers/FireController';
import { UserController } from '../controllers/UserController';
import { LeaderboardController } from '../controllers/LeaderboardController'; // ✅ Import
import { createAuthRoutes } from './auth.routes';
import { createTreeRoutes } from './trees.routes';
import { createFireRoutes } from './fires.routes';
import { createUserRoutes } from './users.routes';
import { createLeaderboardRoutes } from './leaderboard.routes'; // ✅ Import
import { CommentController } from '../controllers/CommentController';
import { createCommentRoutes } from './comments.routes';

export function setupRoutes(
  app: Application,
  controllers: {
    auth: AuthController;
    tree: TreeController;
    fire: FireController;
    user: UserController;
    leaderboard?: LeaderboardController; // ✅ Add optional for now
    comment?: CommentController;
  }
): void {
  const apiRouter = Router();

  apiRouter.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  apiRouter.use('/auth', createAuthRoutes(controllers.auth));
  apiRouter.use('/trees', createTreeRoutes(controllers.tree));
  apiRouter.use('/fires', createFireRoutes(controllers.fire));
  apiRouter.use('/users', createUserRoutes(controllers.user));

  // ✅ Mount leaderboard routes if controller exists
  if (controllers.leaderboard) {
    apiRouter.use('/leaderboard', createLeaderboardRoutes(controllers.leaderboard));
  }

  if (controllers.comment) {
    apiRouter.use('/comments', createCommentRoutes(controllers.comment));
  }
  app.use('/api/v1', apiRouter);
}
