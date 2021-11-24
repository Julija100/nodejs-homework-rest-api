const express = require('express')
const router = express.Router()
const { Conflict, Unauthorized, NotFound, BadRequest } = require('http-errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_KEY } = process.env

const { User } = require('../../model/usersModel')
const authenticate = require('../../utils/authenticate')
const usersValidation = require('../../utils/usersValidation')

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = usersValidation.validate(req.body)

    if (error) {
      throw new BadRequest(error.message)
    }

    const { password, email } = req.body
    const dublicateUser = await User.findOne({ email })

    if (dublicateUser) {
      throw new Conflict('This email already exist')
    }
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const newUser = await User.create({ password: hashedPassword, email })

    res.json({
      status: 'created',
      code: 201,
      user: {
        email: newUser.email,
        subscription: 'starter',
      },
    })
  } catch (error) {
    return next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { password, email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      throw new NotFound('Email or password error')
    }
    const comparePassword = bcrypt.compareSync(password, user.password)

    if (!comparePassword) {
      throw new Unauthorized('Email or password error')
    }

    const payload = { id: user._id }
    const token = jwt.sign(payload, JWT_KEY, { expiresIn: '1h' })
    await User.findByIdAndUpdate(user._id, { token })

    res.json({
      status: 'OK',
      code: 200,
      result: {
        token: token,
        user: {
          email: user.email,
          subscription: user.subscription,
        },
      },
    })
  } catch (error) {
    return next(error)
  }
})

router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user
    const user = await User.findByIdAndUpdate(_id, { token: null })

    if (!user) {
      throw new Unauthorized('Not authorized')
    }
    res.status(204).json()
  } catch (error) {
    return next(error)
  }
})

router.get('/current', authenticate, async (req, res, next) => {
  try {
    const { _id } = req.user
    const currentUser = await User.findById(_id, {
      _id: 0,
      password: 0,
      token: 0,
    })
    if (!currentUser) {
      throw new Unauthorized('Not authorized')
    }

    res.json({
      status: 'OK',
      code: 200,
      result: currentUser,
    })
  } catch (error) {
    return next(error)
  }
})

module.exports = router
