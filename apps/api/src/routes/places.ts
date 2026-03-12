import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { CreatePlaceSchema, UpdatePlaceSchema } from '@holiday-planner/shared'
import type { Request } from 'express'

export const placesRouter = Router()

placesRouter.use(requireAuth)

// GET /places
placesRouter.get('/', async (req: Request, res) => {
  const { userId } = req as AuthRequest
  const { type, tripId, visited } = req.query

  const places = await prisma.place.findMany({
    where: {
      userId,
      ...(type ? { type: type as string } : {}),
      ...(visited !== undefined ? { visited: visited === 'true' } : {}),
      ...(tripId ? { trips: { some: { tripId: tripId as string } } } : {}),
    },
    include: {
      trips: {
        include: { trip: { select: { id: true, name: true } } },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ data: places })
})

// POST /places
placesRouter.post('/', validate(CreatePlaceSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const place = await prisma.place.create({
    data: { ...req.body, userId },
  })

  return res.status(201).json({ data: place })
})

// PATCH /places/:id
placesRouter.patch('/:id', validate(UpdatePlaceSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const place = await prisma.place.findFirst({
    where: { id: req.params.id, userId },
  })
  if (!place) {
    return res.status(404).json({ error: 'Place not found' })
  }

  const updated = await prisma.place.update({
    where: { id: req.params.id },
    data: req.body,
  })

  return res.json({ data: updated })
})

// DELETE /places/:id
placesRouter.delete('/:id', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const place = await prisma.place.findFirst({
    where: { id: req.params.id, userId },
  })
  if (!place) {
    return res.status(404).json({ error: 'Place not found' })
  }

  await prisma.place.delete({ where: { id: req.params.id } })
  return res.status(204).send()
})
