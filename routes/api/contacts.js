const express = require('express')
const router = express.Router()
const { NotFound, BadRequest } = require('http-errors')
const authenticate = require('../../utils/authenticate')

const contactsValidation = require('../../utils/contactsValidation')
const { Contact } = require('../../model/contactsModel')

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const allContacts = await Contact.find()

    res.json(allContacts)
  } catch (error) {
    next(error)
  }
})

router.get('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params
    const contact = await Contact.findById(contactId)

    if (!contact) {
      throw new NotFound('Not found')
    }

    res.status(200).json({ status: 'success', code: 200, data: { contact } })
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { error } = contactsValidation.validate(req.body)

    if (error) {
      throw new BadRequest(error.message)
    }
    const contact = await Contact.create(req.body)

    res.status(201).json({ status: 'success', code: 201, data: contact })
  } catch (error) {
    next(error)
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params

    if (!contactId) {
      throw new NotFound('Not found')
    }

    await Contact.findByIdAndRemove(contactId)
    res
      .status(200)
      .json({ status: 'success', code: 200, message: 'delete contact' })
  } catch (error) {
    next(error)
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = contactsValidation.validate(req.body)

    if (error) {
      throw new BadRequest(error.message)
    }

    const { contactId } = req.params
    const updatedContact = await Contact.findByIdAndUpdate(
      contactId,
      req.body,
      { returnDocument: 'after' }
    )

    if (!updatedContact) {
      throw new NotFound('Not found')
    }

    res.status(201).json({
      status: 'success',
      code: 201,
      data: updatedContact,
    })
  } catch (error) {
    next(error)
  }
})

router.patch('/:contactId/favorite', async (req, res, next) => {
  try {
    const { contactId } = req.params
    const { favorite } = req.body
    if (favorite === undefined) {
      return res.status(400).json({
        message: 'missing field favorite'
      })
    }
    const updatedContact = await Contact.findByIdAndUpdate(contactId, {
      favorite,
    })
    if (updatedContact) {
      return res.json(updatedContact)
    }
    return res.status(404).json({
      message: 'Not found',
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
