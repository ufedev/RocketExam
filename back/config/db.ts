import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: `./${process.env.DB_NAME}`
})

console.log(process.env.DB_NAME)
