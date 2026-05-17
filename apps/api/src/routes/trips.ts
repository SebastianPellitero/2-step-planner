import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  CreateTripSchema,
  UpdateTripSchema,
  AddPlaceToTripSchema,
  ReorderTripPlacesSchema,
  ImportSchema,
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

// POST /trips/import — create a new trip from an exported JSON
tripsRouter.post('/import', validate(ImportSchema), async (req: Request, res) => {
  const { userId } = req as AuthRequest
  const { name, places } = req.body

  const trip = await prisma.trip.create({ data: { name, userId } })

  try {
    for (let i = 0; i < places.length; i++) {
      const p = places[i]
      const place = await prisma.place.create({
        data: {
          name: p.name,
          type: p.type,
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
          description: p.description ?? undefined,
          address: p.address ?? undefined,
          notes: p.notes ?? undefined,
          visited: p.visited ?? false,
          userId,
        },
      })
      await prisma.placeTrip.create({
        data: { placeId: place.id, tripId: trip.id, orderIndex: i },
      })
    }
  } catch (err) {
    await prisma.trip.delete({ where: { id: trip.id } }).catch(() => {})
    return res.status(500).json({ error: 'Failed to import trip' })
  }

  const result = await prisma.trip.findFirst({
    where: { id: trip.id },
    include: {
      places: { include: { place: true }, orderBy: { orderIndex: 'asc' } },
    },
  })

  return res.status(201).json({ data: result })
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

  // Delete places that belong exclusively to this trip (not shared with others)
  const placesInTrip = await prisma.place.findMany({
    where: { userId, trips: { some: { tripId: req.params.id } } },
    include: { trips: { select: { tripId: true } } },
  })
  const exclusivePlaceIds = placesInTrip
    .filter((p) => p.trips.length === 1)
    .map((p) => p.id)

  await prisma.$transaction([
    prisma.place.deleteMany({ where: { id: { in: exclusivePlaceIds } } }),
    prisma.trip.delete({ where: { id: req.params.id } }),
  ])

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
