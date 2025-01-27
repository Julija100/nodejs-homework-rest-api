const { Schema, model } = require('mongoose')

const modelUsersSchema = Schema(
  {
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter'
    },
    avatarURL: { type: String },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
)

const User = model('user', modelUsersSchema)

module.exports = { User }
