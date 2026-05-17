import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { placesRouter } from './routes/places'
import { tripsRouter } from './routes/trips'
import { importExportRouter } from './routes/importExport'

export const app = express()

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:3000' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.use('/auth', authRouter)
app.use('/places', placesRouter)
app.use('/trips', tripsRouter)
app.use('/', importExportRouter)

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})
