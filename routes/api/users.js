const express = require('express')
const router = express.Router()
const { Conflict, Unauthorized, NotFound } = require('http-errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_KEY } = process.env

// const contactsValidation = require('../../utils/contactsValidation')
const { User } = require('../../model/usersModel')
// const authenticate = require('../../utils/authenticate')

router.post('/signup', async (req, res) => {
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
})

router.post('/login', async (req, res) => {
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
})

router.post('/logout', async (req, res) => {
  const { _id } = req.user
  const user = await User.findByIdAndUpdate(_id, { token: null })

  if (!user) {
    throw new Unauthorized('Not authorized')
  }
  res.status(204).json()
})

router.get('/current', async (req, res) => {
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
})

module.exports = router
