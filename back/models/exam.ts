import { sequelize } from '../config/db'
import { DataTypes } from 'sequelize'
export const Exam = sequelize.define('Exam', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  available: {
    type: DataTypes.TINYINT,
    defaultValue: true
  },
  problems: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const raw = this.getDataValue('problems')
      return raw ? JSON.parse(raw) : []
    },
    set(value) {
      this.setDataValue('problems', JSON.stringify(value))
    }
  }
})
