import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { User } from '../models/user'

export interface CustomReq extends Request {
  user?: {
    id: number
    type: string
  }
}

export const auth0 = async (
  req: CustomReq,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorization = req.headers.authorization

  if (!authorization) {
    res.status(403).json({
      error: true,
      msg: 'No autorizado'
    })
    return
  }
  if (process.env.SECRET_KEY) {
    try {
      const verifyToken = jwt.verify(
        authorization.split(' ')[1],
        process.env.SECRET_KEY
      )
      if (typeof verifyToken === 'string') {
        console.log(verifyToken)
        return
      }
      const { dni, id } = verifyToken
      const user = await User.findOne({
        where: {
          dni,
          id
        }
      })
      if (!user) {
        res.status(404).json({
          error: true,
          msg: 'Usuario inexistente'
        })
      }

      req.user = {
        ...user?.dataValues
      }
      next()
    } catch {
      res.status(403).json({
        error: true,
        msg: 'No autorizado'
      })
      return
    }
  } else {
    res.status(500).json({
      error: true,
      msg: 'Hay un error con la sk'
    })
    return
  }
}

export const authAdm = async (
  req: CustomReq,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (req.user) {
    const { type } = req.user

    if (type !== 'PROFESOR') {
      res.status(403).json({
        error: true,
        msg: 'No esta autorizado para hacer esto'
      })
      return
    }
    next()
  } else {
    res.status(403).json({
      error: true,
      msg: 'No esta autorizado para hacer esto'
    })
  }
}
