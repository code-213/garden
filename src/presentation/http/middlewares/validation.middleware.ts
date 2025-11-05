import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from '@shared/errors';

export const validateRequest = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().reduce((acc, error) => {
        acc[error.type === 'field' ? (error as any).path : 'general'] = error.msg;
        return acc;
      }, {} as Record<string, string>);

      throw new ValidationError('Validation failed', errorMessages);
    }

    next();
  };
};