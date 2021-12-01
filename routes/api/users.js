const express = require('express')
const router = express.Router()
const fs = require('fs/promises')
const path = require('path')
const { Conflict, Unauthorized, NotFound, BadRequest } = require('http-errors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const gravatar = require('gravatar')
const Jimp = require('jimp')
const { v4 } = require('uuid')

const { JWT_KEY } = process.env
const uploadAvatars = require('../../utils/uploadAvatars')
const { User } = require('../../model/usersModel')
const authenticate = require('../../utils/authenticate')
const usersValidation = require('../../utils/usersValidation')
const avatarsDir = path.join(__dirname, '../../public/avatars')
const { sendEmail } = require('../../utils/sendEmail')

const sendVerificationEmail = async ({ email, verificationToken }) => {
  await sendEmail({
    to: email,
    subject: 'Email verification',
    html: `<a href="${process.env.WEBSITE_URL}/api/users/verify/${encodeURIComponent(verificationToken)}">Click here to verify email</a>`
  })
}

router.post('/signup', async (req, res, next) => {
  try {
    const { error } = usersValidation.validate(req.body)

    if (error) {
      throw new BadRequest(error.message)
    }

    const { password, email } = req.body
    const avatarURL = gravatar.url(email, { protocol: 'http' })
    const dublicateUser = await User.findOne({ email })

    if (dublicateUser) {
      if (dublicateUser.verify) {
        throw new Conflict('This email already exist')
      }
      await User.deleteOne({ email })
    }

    const verificationToken = v4()
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    const newUser = await User.create({ password: hashedPassword, email, avatarURL, verificationToken })

    const userAvatarFolder = path.join(avatarsDir, String(newUser._id))
    await fs.mkdir(userAvatarFolder)
    await sendVerificationEmail({ email: newUser.email, verificationToken })

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

router.patch('/avatars', authenticate, uploadAvatars.single('avatar'), async (req, res, next) => {
  const { id } = req.user
  const { path: tempUpload, filename } = req.file

  try {
    const resultUpload = path.join(avatarsDir, filename)
    await fs.rename(tempUpload, resultUpload)
    const avatarURL = path.join('/static/avatars', filename)
    const userAvatarImg = await Jimp.read(resultUpload)

    userAvatarImg.resize(250, 250).write(resultUpload)

    const updateUserAvatar = await User.findOneAndUpdate(
      id,
      { avatarURL },
      { returnDocument: 'after' }
    )

    if (!updateUserAvatar) {
      throw new Unauthorized('Not authorized!')
    }
    res.json({
      status: 'OK',
      code: 200,
      avatarURL: updateUserAvatar.avatarURL,
    })
  } catch (error) {
    await fs.unlink(tempUpload)
    next(error)
  }
})

router.get('/verify/:verificationToken', async (req, res, next) => {
  try {
    const { verificationToken } = req.params
    const user = await User.findOne({ verificationToken, verify: false })
    if (!user) {
      throw new NotFound('User not found')
    }
    user.verificationToken = null
    user.verify = true
    await user.save()
    res.json({ message: 'Verification successful' })
  } catch (error) {
    return next(error)
  }
})

router.post('/verify', async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) {
      throw new BadRequest('missing required field email')
    }
    const user = await User.findOne({ email })
    if (!user) {
      throw new NotFound('User not found')
    }
    if (user.verify) {
      throw new BadRequest('Verification has already been passed')
    }

    await sendVerificationEmail({ email, verificationToken: user.verificationToken })
    res.json({ message: 'Verification email sent' })
  } catch (error) {
    return next(error)
  }
})

module.exports = router
