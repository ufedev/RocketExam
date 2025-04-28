import { Router } from 'express'
import { auth0, authAdm, CustomReq } from '../middleware/auth'
// import {sequelize} from '../config/db'
import { fn, col } from 'sequelize'
import { ExamResult, ExamResultType } from '../models/exam_results'
import { Exam } from '../models/exam'
import { User } from '../models/user'
export const examResRouter = Router()

const processorExamResult = (exams: ExamResultType[]) => {
  const newExams = exams.map((exam) => {
    return {
      id: exam.id,
      user: exam.User.get('usuario'),
      exam: exam.Exam.name,
      result: exam.result
    }
  })
  return newExams
}

examResRouter.get('/exam_result/list', auth0, async (req: CustomReq, res) => {
  try {
    if (req.user?.type === 'PROFESOR') {
      const exams = await ExamResult.findAll({
        include: [
          {
            model: User,
            attributes: [
              [fn('concat', col('nombre'), ' ', col('apellido')), 'usuario']
            ]
          },
          {
            model: Exam,
            attributes: ['name']
          }
        ]
      })
      // console.log(exams)
      res.json({ error: false, exams: processorExamResult(exams) })
      return
    }

    const exams = await ExamResult.findAll({
      include: [
        {
          model: User,
          attributes: [
            [fn('concat', col('nombre'), ' ', col('apellido')), 'usuario']
          ]
        },
        {
          model: Exam,
          attributes: ['name']
        }
      ],
      where: {
        UserId: req.user?.id
      }
    })

    res.json({
      error: false,
      exams: processorExamResult(exams)
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        error: true,
        msg: err.message
      })
    } else {
      res.status(500).json({
        error: true,
        msg: 'Error en el servidor indefinido'
      })
    }
  }
})

examResRouter.get(
  '/exam_result/get/:id',
  auth0,
  async (req: CustomReq, res) => {
    const { user } = req
    const { id } = req.params

    try {
      const resultExam = await ExamResult.findOne({
        where: {
          ExamId: id,
          UserId: user?.id
        }
      })
      res.json({
        error: false,
        resultExam
      })
    } catch {
      res.json({
        error: true,
        msg: 'Hubo un error al consultar la base de datos'
      })
      return
    }
  }
)

examResRouter.delete('/exam_result/:id', auth0, authAdm, async (req, res) => {
  try {
    await ExamResult.destroy({
      where: {
        id: req.params.id
      }
    })
    res.json({
      error: false,
      msg: 'Resultado eliminado'
    })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({
        error: true,
        msg: err.message
      })
    } else {
      res.status(500).json({
        error: true,
        msg: 'Error inesperado'
      })
    }
  }
})
