import { ZodError } from 'zod';

export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: err.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(err);
    }
  };
}

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Query validation failed',
            details: err.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(err);
    }
  };
}
