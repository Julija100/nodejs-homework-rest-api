const multer = require('multer')
const path = require('path')
const { v4 } = require('uuid')
const tempDir = path.join(__dirname, '../temp')

const uploadConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname)
    const filename = `${v4()}${extension}`
    cb(null, filename)
  },
  limits: {
    fileSize: 2048
  }
})

const uploadAvatar = multer({
  storage: uploadConfig
})

module.exports = uploadAvatar
