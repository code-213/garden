// src/shared/types/express.d.ts
// CREATE NEW FILE - Extend Express types

import { User } from '@domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?:
        | {
            id: string;
            email: string;
            name: string;
            role: 'user' | 'admin';
            avatar?: string;
            bio?: string;
            location?: string;
            createdAt: Date;
          }
        | User;
    }
  }
}

export {};
