import { User } from '../models/user'
import { Router } from 'express'
import type { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { auth0, CustomReq } from '../middleware/auth'
import { activateAccount } from '../helpers/mails'
import { v4 as uuid } from 'uuid'
export const userRouter = Router()

const secret = process.env.SECRET_KEY

userRouter.post(
  '/signin',
  async (req: Request, res: Response): Promise<void> => {
    const { nombre, email, apellido, dni, password, rePassword } = req.body

    if ([nombre, email, apellido, dni, password, rePassword].includes('')) {
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
      const token = uuid()
      const newUser = await User.create({
        nombre,
        apellido,
        dni,
        email,
        token,
        password: hashPassword,
        type
      })

      await newUser.save()
      await activateAccount(email, token)
      res.json({
        error: false,
        msg: 'Usuario creado, verifica tu correo para activar la cuenta'
      })
    } catch {
      res.status(401).json({
        error: true,
        msg: 'El usuario ya existe'
      })
    }

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

    if (!u.active) {
      res.status(401).json({
        error: true,
        msg: "La cuenta no esta verificada"
      })
      return
    }
    const { id, email, nombre, apellido, type, dni: DNI } = u.dataValues
    const payload = {
      id,
      nombre,
      email,
      apellido,
      dni: DNI,
      type
    }

    const wt = jwt.sign(payload, secret ?? '')

    res.json({
      error: false,
      user: {
        nombre,
        email,
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
userRouter.get('/activate_account/:token', async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params
    const u = await User.findOne({
      where: {
        token
      }
    })
    if (!u) {
      res.status(404).json({
        error: true,
        msg: "No encotrado"
      })
      return
    }

    u.active = true
    u.token = ""
    await u.save()
    res.status(201).json({
      error: false,
      msg: "Cuenta activada  "
    })

  } catch {

    res.status(500).json({
      error: true,
      msg: `Hubo un error en el servidor`
    })
  }
})




