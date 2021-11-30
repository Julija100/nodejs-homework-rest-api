const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const authenticate = require('./utils/authenticate')

require('dotenv').config()

const usersRouter = require('./routes/api/users')
const contactsRouter = require('./routes/api/contacts')

const app = express()
app.use('/static', authenticate, express.static('public'))

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)
app.use('/api/contacts', contactsRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({ message: err.message })
  console.warn(err)
})

module.exports = app
