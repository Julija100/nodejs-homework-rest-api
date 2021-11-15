const app = require('../app')
const mongoose = require('mongoose')

const PORT = process.env.PORT || 3000
const DB_HOST =
  'mongodb+srv://JuliaFaltina:t1R5Gd9SLXs4LS1Y@cluster0.luj0b.mongodb.net/db-contacts?retryWrites=true&w=majority'

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
