const { Unauthorized } = require('http-errors')
const jwt = require('jsonwebtoken')

const { User } = require('../model/usersModel')
const { JWT_KEY } = process.env

const authenticate = async (req, res, next) => {
  try {
    const [bearer, token] = req.headers.authorization.split(' ')
    const { id } = jwt.verify(token, JWT_KEY)
    let user

    if (bearer === 'Bearer' && token) {
      user = await User.findById(id)
    }

    if (user && user.token === token) {
      req.user = user
      next()
    } else {
      throw new Error('Not found')
    }
  } catch (error) {
    return next(new Unauthorized('Not authorized'))
  }
}

module.exports = authenticate
