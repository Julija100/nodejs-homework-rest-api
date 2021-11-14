const fs = require('fs/promises')
const crypto = require('crypto')

const contactsPath = require('./contactsPath')
const getAllContacts = require('../utils/getAllContacts')

const listContacts = async () => await getAllContacts(contactsPath)

const getContactById = async (contactId) => {
  const allContacts = await getAllContacts()

  const necessaryContact = allContacts.find(
    ({ id }) => id.toString() === contactId.toString()
  )
  if (necessaryContact) {
    return necessaryContact
  } else {
    return null
  }
}

const removeContact = async (contactId) => {
  const prevContact = await getAllContacts()
  const deletedContact = prevContact.find(
    ({ id }) => id.toString() === contactId.toString()
  )

  if (!deletedContact) {
    return null
  }
  const newContact = prevContact.filter(
    ({ id }) => id.toString() !== contactId.toString()
  )
  await fs.writeFile(contactsPath, JSON.stringify(newContact, null, 2))

  return newContact
}

const addContact = async ({ name, email, phone }) => {
  const prevContact = await getAllContacts()
  const newContact = { id: crypto.randomUUID(), name, email, phone }
  const updatedContacts = [...prevContact, newContact]

  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2))

  return newContact
}

const updateContact = async (contactId, body) => {
  const allContacts = await getAllContacts()

  const updatedContactIndex = allContacts.findIndex((contact) => contact.id.toString() === contactId.toString()
  )
  if (updatedContactIndex === -1) {
    return null
  }

  allContacts[updatedContactIndex] = { id: contactId, ...body }
  await fs.writeFile(contactsPath, JSON.stringify(allContacts, null, 2))

  return allContacts[updatedContactIndex]
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
