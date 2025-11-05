import { Router, Application, Request,Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { TreeController } from '../controllers/TreeController';
import { FireController } from '../controllers/FireController';
import { UserController } from '../controllers/UserController';
import { createAuthRoutes } from './auth.routes';
import { createTreeRoutes } from './trees.routes';
import { createFireRoutes } from './fires.routes';
import { createUserRoutes } from './users.routes';

export function setupRoutes(
  app: Application,
  controllers: {
    auth: AuthController;
    tree: TreeController;
    fire: FireController;
    user: UserController;
  }
): void {
  const apiRouter = Router();

  // Health check
  apiRouter.get('/health', (req:Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount routes
  apiRouter.use('/auth', createAuthRoutes(controllers.auth));
  apiRouter.use('/trees', createTreeRoutes(controllers.tree));
  apiRouter.use('/fires', createFireRoutes(controllers.fire));
  apiRouter.use('/users', createUserRoutes(controllers.user));

  // Mount API router
  app.use('/api/v1', apiRouter);
}