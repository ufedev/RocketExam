import { sequelize } from '../config/db'
import { DataTypes, Model } from 'sequelize'

export interface UserType extends Model {
  nombre: string
  apellido: string
  password: string
  email: string
  token: string
  active: boolean
  type: 'PROFESOR' | 'ESTUDIANTE'
}
export const User = sequelize.define<UserType>('User', {
  dni: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  token: {
    type: DataTypes.STRING,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  password: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'ESTUDIANTE'
  }
})
