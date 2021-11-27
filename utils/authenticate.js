const { Unauthorized, NotFound } = require('http-errors')
const jwt = require('jsonwebtoken')

const { User } = require('../model/usersModel')
const { JWT_KEY } = process.env

const authenticate = async (req, res, next) => {
  try {
    const [, token] = req.headers.authorization.split(' ')
    let id
    try {
      id = jwt.verify(token, JWT_KEY).id
    } catch (error) {
      throw new Unauthorized('Not authorized')
    }

    const user = await User.findById(id)
    if (!user) {
      throw new NotFound('User not found')
    }

    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = authenticate
