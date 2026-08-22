import type { NextFunction, Request, Response } from 'express';

import { prisma } from '../lib/prisma';
import { getAdminOverview } from '../services/admin.service';

export async function adminOverviewController(_req: Request, res: Response, next: NextFunction) {
  try {
    const overview = await getAdminOverview(prisma);

    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return next(error);
  }
}
