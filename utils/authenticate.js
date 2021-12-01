const { Unauthorized, NotFound, Forbidden } = require('http-errors')
const jwt = require('jsonwebtoken')

const { User } = require('../model/usersModel')
const { JWT_KEY } = process.env

const authenticate = async (req, res, next) => {
  try {
    let id
    try {
      const [, token] = req.headers.authorization.split(' ')
      id = jwt.verify(token, JWT_KEY).id
    } catch (error) {
      throw new Unauthorized('Not authorized')
    }

    const user = await User.findById(id)
    if (!user) {
      throw new NotFound('User not found')
    }

    if (!user.verify) {
      throw new Forbidden('User not verified')
    }

    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}

module.exports = authenticate
