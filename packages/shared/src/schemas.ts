import { z } from 'zod'

export const PlaceTypeEnum = z.enum([
  'RESTAURANT',
  'MUSEUM',
  'HIKE',
  'HOTEL',
  'NATURE',
  'TEMPLE',
  'BEACH',
  'MARKET',
  'BAR',
  'SHOP',
  'OTHER',
])

// ── Auth ───────────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ── Places ─────────────────────────────────────────────────────────────────────

export const CreatePlaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional(),
  type: PlaceTypeEnum,
  notes: z.string().optional(),
})

export const UpdatePlaceSchema = CreatePlaceSchema.partial().extend({
  visited: z.boolean().optional(),
})

// ── Trips ──────────────────────────────────────────────────────────────────────

export const CreateTripSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
})

export const UpdateTripSchema = CreateTripSchema.partial()

export const AddPlaceToTripSchema = z.object({
  placeId: z.string().cuid(),
  orderIndex: z.number().int().min(0).optional(),
})

export const ReorderTripPlacesSchema = z.object({
  order: z.array(
    z.object({
      placeId: z.string().cuid(),
      orderIndex: z.number().int().min(0),
    })
  ),
})

// ── Import / Export ────────────────────────────────────────────────────────────

export const ExportPlaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  address: z.string().optional().nullable(),
  type: PlaceTypeEnum,
  notes: z.string().optional().nullable(),
  visited: z.boolean().optional(),
})

export const ImportSchema = z.object({
  version: z.literal('1.0'),
  exportedAt: z.string().optional(),
  name: z.string(),
  places: z.array(ExportPlaceSchema),
})

// ── Inferred types ─────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type CreatePlaceInput = z.infer<typeof CreatePlaceSchema>
export type UpdatePlaceInput = z.infer<typeof UpdatePlaceSchema>
export type CreateTripInput = z.infer<typeof CreateTripSchema>
export type UpdateTripInput = z.infer<typeof UpdateTripSchema>
export type ImportInput = z.infer<typeof ImportSchema>
