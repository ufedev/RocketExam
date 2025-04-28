import { User } from '../models/user'
import { Router } from 'express'
import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { auth0, CustomReq } from '../middleware/auth'
export const userRouter = Router()

const secret = process.env.SECRET_KEY

userRouter.post(
  '/signin',
  async (req: Request, res: Response): Promise<void> => {
    const { nombre, apellido, dni, password, rePassword } = req.body

    if ([nombre, apellido, dni, password, rePassword].includes('')) {
      res.status(401).json({
        error: true,
        msg: 'Hay campos vacios'
      })
      return
    }
    if (password !== rePassword) {
      res.status(401).json({
        error: true,
        msg: 'Las contraseñas no coinciden'
      })
      return
    }

    if (password.length < 8) {
      res.status(401).json({
        error: true,
        msg: 'La contraseña debe contener al menos 8 caracteres'
      })
      return
    }

    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)
    let type = 'ESTUDIANTE'
    try {
      const getAllUsers = await User.findAll()
      if (getAllUsers.length === 0) {
        type = 'PROFESOR'
      }

      const newUser = await User.create({
        nombre,
        apellido,
        dni,
        password: hashPassword,
        type
      })

      await newUser.save()

      res.json({
        error: false,
        msg: 'Usuario creado, ya puedes iniciar sesión'
      })
    } catch {
      res.status(401).json({
        error: true,
        msg: 'El usuario ya existe'
      })
    }

    // res.json(req.body)
  }
)

userRouter.post(
  '/login',
  async (req: Request, res: Response): Promise<void> => {
    const { dni, password } = req.body

    if ([dni, password].includes('')) {
      res.status(403).json({
        error: true,
        msg: 'Todos los campos son obligatorios'
      })
      return
    }

    const u = await User.findOne({
      where: {
        dni
      }
    })

    if (!u) {
      res.status(404).json({
        error: true,
        msg: 'El usuario no existe'
      })
      return
    }

    // res.json(u.dataValues.password)
    const verifyPassword = await bcrypt.compare(password, u.dataValues.password)

    if (!verifyPassword) {
      res.status(401).json({
        error: true,
        msg: 'La contraseña es incorrecta'
      })
      return
    }

    const { id, nombre, apellido, type, dni: DNI } = u.dataValues
    const payload = {
      id,
      nombre,
      apellido,
      dni: DNI,
      type
    }

    const wt = jwt.sign(payload, secret ?? '', {
      expiresIn: '2h'
    })

    res.json({
      error: false,
      user: {
        nombre,
        apellido,
        dni,
        type
      },
      token: wt
    })
  }
)

userRouter.post('/verify_auth', auth0, async (req: CustomReq, res) => {
  res.json(req?.user)
})
