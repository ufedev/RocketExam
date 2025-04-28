import { Problem } from '../models/problems'
import { Router, Response } from 'express'
import { auth0, authAdm, CustomReq } from '../middleware/auth'

export const problemsRouter = Router()

problemsRouter.post(
  '/problem/create',
  auth0,
  authAdm,
  async (req: CustomReq, res: Response) => {
    const { input, output, description, title, complexity } = req.body

    try {
      const problem = await Problem.create({
        input,
        output,
        description,
        title,
        complexity
      })

      await problem.save()

      res.json({
        error: false,
        msg: 'Problema creado con exito'
      })
    } catch (e) {
      console.error(e)
      res.status(500).json({
        error: true,
        msg: 'Hay un error con la base de datos'
      })
    }
  }
)

problemsRouter.get('/problem/list', auth0, authAdm, async (_, res) => {
  try {
    const problems = await Problem.findAll()
    res.json({
      error: false,
      problems: problems
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      error: true,
      msg: 'Error en el servidor al buscar los problemas'
    })
  }
})

problemsRouter.delete('/problem/:id', auth0, authAdm, async (req, res) => {
  try {
    await Problem.destroy({
      where: {
        id: req.params.id
      }
    })

    res.json({
      error: false,
      msg: 'Problema eliminado'
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
