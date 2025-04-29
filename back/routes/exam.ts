import { Router, Response } from 'express'
import { Exam } from '../models/exam'
import { Problem } from '../models/problems'
import { ExamResult } from '../models/exam_results'
import { auth0, authAdm, CustomReq } from '../middleware/auth'
export const examRouter = Router()

examRouter.post(
  '/exam/create',
  auth0,
  authAdm,
  async (req: CustomReq, res: Response) => {
    try {
      if (
        [req.body.name, req.body.subject].includes('') ||
        req.body.problems.length === 0
      ) {
        res.status(403).json({
          error: true,
          msg: 'Faltan datos para crear el examen'
        })
        return
      }
    } catch {
      res.status(403).json({
        error: true,
        msg: 'Faltan datos para crear el examen'
      })
      return
    }

    try {
      const { name, subject, problems } = req.body

      const p = Array.from(new Set(problems))

      if (p.length !== problems.length) {
        res.status(404).json({
          error: true,
          msg: 'Estas queriendo agregar varias veces el mismo problema'
        })
        return
      }

      for (let i = 0; i < p.length; i++) {
        try {
          const existsProblem = await Problem.findOne({
            where: {
              id: p[i]
            }
          })

          if (!existsProblem) {
            res.status(404).json({
              error: true,
              msg: 'Uno o varios problemas seleccionados no existen.'
            })
            return
          }
        } catch {
          res.status(404).json({
            error: true,
            msg: 'Uno o varios problemas seleccionados no existen.'
          })
        }
      }
      const exam = await Exam.create({
        name,
        subject,
        problems: p
      })

      await exam.save()

      res.json({
        error: false,
        msg: `Examen ${name} creado con exito`
      })
    } catch (e) {
      console.log(e)
      res.status(500).json({
        error: true,
        msg: 'Ese nombre de examen ya esta siendo utilizado'
      })
    }
  }
)

examRouter.get('/exam/list', auth0, async (req, res) => {
  try {
    const exams = await Exam.findAll()

    res.json({
      error: false,
      exams: exams
    })
  } catch {
    res.status(500).json({
      error: true,
      msg: 'Hay un error con el servidor'
    })
  }
})

examRouter.get('/exam/list/:id', auth0, async (req, res) => {
  try {
    const exam = await Exam.findOne({
      where: {
        id: req.params.id
      }
    })
    if (!exam) {
      res.status(404).json({
        error: true,
        msg: 'Examen no encontrado'
      })
      return
    }
    const problems = []
    const examProblems = exam.get('problems')

    const examPID = Array.isArray(examProblems) ? examProblems : []

    for (let i = 0; i < examPID.length; i++) {
      const p = await Problem.findOne({
        where: {
          id: examPID[i]
        }
      })

      if (!p) {
        res.status(404).json({
          error: true,
          msg: 'El problema no existe'
        })
        return
      }
      problems.push(p.dataValues)
    }

    const result = {
      ...exam.dataValues,
      problems
    }

    res.json({
      error: false,
      exam: result
    })
  } catch (e) {
    console.log(e)
    res.status(500).json({
      error: true,
      msg: 'Ocurrio un problema con el servidor'
    })
  }
})

examRouter.post('/exam/problem/test', auth0, async (req: CustomReq, res) => {
  try {
    const problem = await Problem.findOne({
      where: {
        id: req.body.problem
      }
    })

    if (!problem) {
      res.status(404).json({
        error: true,
        msg: 'Problema no encontrado'
      })
      return
    }

    const inputsCases = problem.get('input')

    const inputs = Array.isArray(inputsCases) ? inputsCases : []

    // console.log(problemas[1])

    const realCode = `
    ${req.body.resolvCode}
    const inputs = ${JSON.stringify(inputs)}
    inputs.forEach(input=>{
      console.log(solucion(...input))
    })
    `

    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source_code: realCode,
        language_id: 63,
        stdin: ''
      })
    }

    const request = await fetch(`${process.env.JUDGE_URL}/submissions`, config)

    const response = await request.json()
    const token = response.token

    let resultToken = null
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const requestToken = await fetch(
        `${process.env.JUDGE_URL}/submissions/${token}`
      )
      resultToken = await requestToken.json()
    } while (resultToken.status.id <= 2)

    if (resultToken.status.id === 11) {
      res.status(500).json({
        error: true,
        result: resultToken.stderr
      })
      return
    }

    // res.json(resultToken)
    // return
    const output = resultToken.stdout.trim().split('\n')
    const realOutput = output.map((o: any) => JSON.parse(o))
    const out = problem.get('output')
    const expectedOutput = Array.isArray(out) ? out : []

    const finalOutput = expectedOutput.map((o: any, index) => {
      if (JSON.stringify(o) === JSON.stringify(realOutput[index])) {
        return `output: ${JSON.stringify(realOutput[index])} ✅\n`
      }
      return `output: ${JSON.stringify(realOutput[index])} ⚠️\n`
    })

    res.json({
      error: false,
      result: finalOutput
    })
  } catch (er) {
    if (er instanceof Error) {
      res.json({
        error: true,
        result: er.message
      })
      return
    }
    res.json({
      error: true,
      result: 'ERROR EN EL SERVIDOR'
    })
  }
})

examRouter.post('/exam/result', auth0, async (req: CustomReq, res) => {
  const { examId, resolvCodes } = req.body
  const resolution = []

  const maxNote = 100
  let note = 0
  try {
    const examResultExists = await ExamResult.findOne({
      where: {
        ExamId: examId,
        UserId: req.user?.id
      }
    })
    if (examResultExists) {
      res.status(403).json({
        error: true,
        msg: 'Ya tomaste el examen'
      })
      return
    }
  } catch (e) {
    res.status(500).json({
      error: true,
      msg: 'Hubo un error con la base de datos'
    })
    return
  }
  const exam = await Exam.findOne({
    where: {
      id: examId
    }
  })

  if (!exam) {
    res.status(404).json({
      error: true,
      msg: 'Examen no encontrado'
    })
    return
  }

  const problemsExam = exam?.get('problems')

  const verifyProblems = Array.isArray(problemsExam) ? problemsExam : []

  for (const keys in resolvCodes) {
    if (verifyProblems.includes(Number(keys))) continue

    res.status(404).json({
      error: true,
      msg: 'Uno de los problemas no se encuentra en el examen actual'
    })
    return
  }

  const problemNote = maxNote / verifyProblems.length

  for (const [key, code] of Object.entries(resolvCodes)) {
    const problem = await Problem.findOne({
      where: {
        id: key
      }
    })

    if (!problem) {
      res.status(404).json({
        error: true,
        msg: 'El problema no se encontró'
      })
      return
    }

    const inputsCases = problem.get('input')
    const inputs = Array.isArray(inputsCases) ? inputsCases : []
    const outputsCases = problem.get('output')
    const outputs = Array.isArray(outputsCases) ? outputsCases : []

    const testNote = problemNote / inputs.length

    const realCode = `
    ${code}

    const inputs = ${JSON.stringify(inputs)}

    inputs.forEach((input)=>{
    
    console.log(solucion(...input))
    
    })

    `

    try {
      // Realizamos el envio del código para su verificación
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language_id: 63,
          source_code: realCode,
          stdin: ''
        })
      }
      const fetchToken = await fetch(
        `${process.env.JUDGE_URL}/submissions`,
        config
      )
      const resultToken = await fetchToken.json()
      let partialResult = null
      // Hacemos pooling para obtener los resultados
      do {
        const fetchResult = await fetch(
          `${process.env.JUDGE_URL}/submissions/${resultToken.token}`
        )
        partialResult = await fetchResult.json()
      } while (partialResult.status.id <= 2)
      // res.json(partialResult)
      // Si es satisfactorio vemos los resultados osea ID=3 o aceptado
      if (partialResult.status.id === 3) {
        // obtenemos los outputs del fetch anterior del poooling
        // y lo noramlizamos a algo leible por javascript
        const outputsResults = partialResult.stdout.trim().split('\n')
        // Lo recorremos
        outputsResults.forEach((or: any, index: number) => {
          /* 
          Un pequeño hack para que se  parsee bien 
          y podamos pasarlo a texto correctamente
          */
          const orJ = JSON.stringify(JSON.parse(or))
          // Pasamos a texto los outputs en su indice correspondiente
          const outputJ = JSON.stringify(outputs[index])
          // Si es igual se suma a la nota final el testnote
          if (orJ === outputJ) {
            note += testNote
          }
        })
      }
      resolution.push({
        problem: problem.get('name'),
        problemId: problem.get('id'),
        resolvCode: code
      })
    } catch (e) {
      res.status(500).json({
        error: true,
        msg: e
      })
    }

    // const testNote=
  }
  const userId = req.user?.id
  if (!userId) {
    res.status(404).json({
      error: true,
      msg: 'Uusario no encontrado'
    })
    return
  }
  const examResult = await ExamResult.create({
    result: note,
    problemsCode: resolution,
    ExamId: examId,
    UserId: userId
  })
  await examResult.save()

  res.json({
    error: false,
    result: {
      resolution,
      note
    }
  })
})

examRouter.get('/exam/all', auth0, async (req: CustomReq, res) => {
  const results = await ExamResult.findAll()

  res.json(results)
})

examRouter.delete('/exam/:id', auth0, authAdm, async (req, res) => {
  try {
    await Exam.destroy({
      where: {
        id: req.params.id
      }
    })

    res.json({
      error: false,
      msg: 'Examen eliminado'
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

examRouter.get('/exam/get/:id', auth0, async (req: CustomReq, res) => {
  const { user, params } = req
  const { id } = params

  try {
    const exam = await ExamResult.findOne({
      where: {
        UserId: user?.id,
        ExamId: id
      }
    })

    if (!exam) {
      res.status(404).json({
        error: true,
        msg: 'No encontrado'
      })
      return
    }

    res.json({
      error: false,
      result: exam
    })
  } catch (e) {
    res.status(500).json({
      error: true,
      msg: 'Ocurrio un error en el servidor'
    })
  }
})

examRouter.get('/exam/get_by_user', auth0, async (req: CustomReq, res) => {
  const { user, params } = req
  // const { id } = params

  try {
    const exam = await ExamResult.findAll({
      where: {
        UserId: user?.id
        // ExamId: id
      }
    })

    if (!exam) {
      res.status(404).json({
        error: true,
        msg: 'No encontrado'
      })
      return
    }

    res.json({
      error: false,
      result: exam
    })
  } catch (e) {
    res.status(500).json({
      error: true,
      msg: 'Ocurrio un error en el servidor'
    })
  }
})
