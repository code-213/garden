import { body, param } from 'express-validator';

export const plantTreeValidator = [
  body('species')
    .notEmpty()
    .withMessage('Species is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Species must be between 2 and 100 characters'),

  body('location.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('location.address')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Address must not exceed 255 characters'),

  body('image')
    .optional()
    .isURL()
    .withMessage('Image must be a valid URL'),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

export const waterTreeValidator = [
  param('treeId')
    .notEmpty()
    .withMessage('Tree ID is required')
    .isUUID()
    .withMessage('Invalid tree ID format'),

  body('notes')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters')
];
