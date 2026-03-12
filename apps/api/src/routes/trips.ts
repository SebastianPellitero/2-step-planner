import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  CreateTripSchema,
  UpdateTripSchema,
  AddPlaceToTripSchema,
  ReorderTripPlacesSchema,
} from '@holiday-planner/shared'
import type { Request } from 'express'

export const tripsRouter = Router()

tripsRouter.use(requireAuth)

// GET /trips
tripsRouter.get('/', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trips = await prisma.trip.findMany({
    where: { userId },
    include: {
      places: {
        include: { place: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ data: trips })
})

// GET /trips/:id
tripsRouter.get('/:id', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trip = await prisma.trip.findFirst({
    where: { id: req.params.id, userId },
    include: {
      places: {
        include: { place: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  })

  if (!trip) return res.status(404).json({ error: 'Trip not found' })
  return res.json({ data: trip })
})

// POST /trips
tripsRouter.post('/', validate(CreateTripSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trip = await prisma.trip.create({
    data: { ...req.body, userId },
  })

  return res.status(201).json({ data: trip })
})

// PATCH /trips/:id
tripsRouter.patch('/:id', validate(UpdateTripSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId } })
  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  const updated = await prisma.trip.update({
    where: { id: req.params.id },
    data: req.body,
  })

  return res.json({ data: updated })
})

// DELETE /trips/:id
tripsRouter.delete('/:id', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId } })
  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  await prisma.trip.delete({ where: { id: req.params.id } })
  return res.status(204).send()
})

// POST /trips/:id/places — add a place to a trip
tripsRouter.post('/:id/places', validate(AddPlaceToTripSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest
  const { placeId, orderIndex } = req.body

  const [trip, place] = await Promise.all([
    prisma.trip.findFirst({ where: { id: req.params.id, userId } }),
    prisma.place.findFirst({ where: { id: placeId, userId } }),
  ])

  if (!trip) return res.status(404).json({ error: 'Trip not found' })
  if (!place) return res.status(404).json({ error: 'Place not found' })

  const existing = await prisma.placeTrip.findUnique({
    where: { placeId_tripId: { placeId, tripId: req.params.id } },
  })
  if (existing) return res.status(409).json({ error: 'Place already in trip' })

  const count = await prisma.placeTrip.count({ where: { tripId: req.params.id } })

  await prisma.placeTrip.create({
    data: {
      placeId,
      tripId: req.params.id,
      orderIndex: orderIndex ?? count,
    },
  })

  return res.status(201).json({ data: null, message: 'Place added to trip' })
})

// DELETE /trips/:id/places/:placeId
tripsRouter.delete('/:id/places/:placeId', async (req: Request, res) => {
  const { userId } = req as AuthRequest

  const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId } })
  if (!trip) return res.status(404).json({ error: 'Trip not found' })

  await prisma.placeTrip.deleteMany({
    where: { tripId: req.params.id, placeId: req.params.placeId },
  })

  return res.status(204).send()
})

// PATCH /trips/:id/places/reorder
tripsRouter.patch(
  '/:id/places/reorder',
  validate(ReorderTripPlacesSchema),
  async (req: Request, res) => {
    const { userId } = req as AuthRequest

    const trip = await prisma.trip.findFirst({ where: { id: req.params.id, userId } })
    if (!trip) return res.status(404).json({ error: 'Trip not found' })

    await prisma.$transaction(
      req.body.order.map(({ placeId, orderIndex }: { placeId: string; orderIndex: number }) =>
        prisma.placeTrip.update({
          where: { placeId_tripId: { placeId, tripId: req.params.id } },
          data: { orderIndex },
        })
      )
    )

    return res.json({ data: null, message: 'Order updated' })
  }
)
