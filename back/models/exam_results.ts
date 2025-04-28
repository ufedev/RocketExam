import { sequelize } from '../config/db'
import { DataTypes, Model } from 'sequelize'
import type { UserType } from './user'
interface Problem {
  id: number
  resolvCode: string
}

export interface ExamResultType extends Model {
  id: number
  Exam: {
    name: string
  }
  ExamId: number
  User: UserType
  UserId: number
  problemsCode: Problem[] | string
  result: number
  createdAt: string
  updatedAt: string
}

export const ExamResult = sequelize.define<ExamResultType>('ExamResult', {
  result: {
    type: DataTypes.DOUBLE
  },
  problemsCode: {
    type: DataTypes.TEXT,
    get() {
      const raw = this.getDataValue('problemsCode')
      return raw ? JSON.parse(raw) : []
    },
    set(value) {
      this.setDataValue('problemsCode', JSON.stringify(value))
    }
  }
})
