import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { ImportSchema } from '@holiday-planner/shared'
import type { Request } from 'express'
import type { Place } from '@prisma/client'

export const importExportRouter = Router()

importExportRouter.use(requireAuth)

// GET /export — export all places as JSON
importExportRouter.get('/export', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const places = await prisma.place.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  })

  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    name: 'My Holiday Places',
    places: places.map(({ id: _id, userId: _uid, createdAt: _ca, updatedAt: _ua, ...rest }: Place) => rest),
  }

  return res.json({ data: payload })
})

// POST /import — import a list of places
importExportRouter.post('/import', validate(ImportSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest
  const { places } = req.body

  const created = await prisma.place.createMany({
    data: places.map((p: Record<string, unknown>) => ({ ...p, userId })),
    skipDuplicates: true,
  })

  return res.status(201).json({
    data: { imported: created.count },
    message: `${created.count} places imported`,
  })
})
