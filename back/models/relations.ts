import { Exam } from './exam'
import { ExamResult } from './exam_results'
import { User } from './user'

// ExamResult
ExamResult.belongsTo(User, {
  foreignKey: {
    allowNull: false
  }
})
ExamResult.belongsTo(Exam, {
  foreignKey: {
    allowNull: false
  }
})
// User
User.hasMany(ExamResult)
// Exam
Exam.hasMany(ExamResult)
