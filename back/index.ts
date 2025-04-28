import dotenv from 'dotenv'
dotenv.config({
  path: './.env'
})
import express from 'express'
import './models/relations'
import type { Response } from 'express'
import { sequelize } from './config/db'
import { User } from './models/user'
import { userRouter } from './routes/user'
import { problemsRouter } from './routes/problems'
import { examRouter } from './routes/exam'
import { examResRouter } from './routes/exam_results'
import cors from 'cors'
// APP

const port = process.argv[2] ?? 3000

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (_, res: Response): Promise<void> => {
  const users = await User.findAll()
  res.json(users)
})
// USERS
app.use('/api', userRouter)
// PROBLEMS
app.use('/api', problemsRouter)
// Exams
app.use('/api', examRouter)
// Resutls
app.use('/api', examResRouter)

app.listen(port, async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync()
    console.log('Base de datos conectada')
    console.log('Servidor corriendo en puerto ' + port)
  } catch {
    console.error('No se pudo conectar a la  base de datos')
  }
})
