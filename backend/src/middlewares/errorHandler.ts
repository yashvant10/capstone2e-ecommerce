import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  public status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err);

  const status = err instanceof ApiError ? err.status : 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: {
      message
    }
  });
}
