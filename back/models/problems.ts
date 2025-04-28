import { sequelize } from '../config/db'
import { DataTypes } from 'sequelize'

export const Problem = sequelize.define('Problem', {
  input: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('input')
      return raw ? JSON.parse(raw) : []
    },
    set(value) {
      this.setDataValue('input', JSON.stringify(value))
    }
  },
  output: {
    type: DataTypes.JSON,
    allowNull: false,
    get() {
      const raw = this.getDataValue('output')
      return raw ? JSON.parse(raw) : []
    },
    set(value) {
      this.setDataValue('output', JSON.stringify(value))
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  complexity:{
    type:DataTypes.STRING,
    allowNull:false,
    defaultValue:'Fácil'
  }
})
