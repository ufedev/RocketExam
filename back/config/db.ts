import { Sequelize } from 'sequelize'

const PORT = process.env.DB_PORT
const HOST = process.env.DB_HOST
const USER = process.env.DB_USER
const PASS = process.env.DB_PASS
const NAME = process.env.DB_NAME
export const sequelize = new Sequelize(`mysql://${HOST}:${PORT}/${NAME}`, {
  username: USER,
  password: PASS,
  logging: false
})

console.log(process.env.DB_NAME)
