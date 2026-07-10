import { Request, Response } from 'express';

export const getHealthHandler = (req: Request, res: Response) => {
  return res.json({ status: 'ok', timestamp: new Date().toISOString() });
};
