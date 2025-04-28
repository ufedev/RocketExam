import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: '0.0.0.0',
  port: 3306,
  username: 'root',
  password: 'aezakmi',
  database: 'rocketexam'
  // storage: `./${process.env.DB_NAME}`
})

console.log(process.env.DB_NAME)
