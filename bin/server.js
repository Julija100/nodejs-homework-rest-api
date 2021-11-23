require('dotenv').config()
const app = require('../app')
const mongoose = require('mongoose')

const PORT = process.env.PORT
const DB_HOST = process.env.DB_HOST

mongoose
  .connect(DB_HOST)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Database connection successful. Server running. Use our API on port: http://localhost:${PORT}`
      )
    })
  })
  .catch((err) => {
    console.log(`Server error. Error message: ${err.message}`)
    process.exit(1)
  })
