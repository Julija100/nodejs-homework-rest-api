const { Contact } = require('../model/contactsModel')

const getAllContacts = async () => {
  const contacts = await Contact.find()
  return contacts
}

const getContactById = async (contactId) => {
  try {
    return await Contact.findById(contactId)
  } catch {
    return null
  }
}

const removeContact = async (contactId) => {
  try {
    await Contact.findByIdAndRemove(contactId)
  } catch (error) {
    console.error(error)
    return null
  }
}

const addContact = async ({ name, email, phone }) => {
  await Contact.create({ name, email, phone })
}

const updateContact = async (contactId, body) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, body, {
    new: true,
  })

  return updatedContact
}

module.exports = {
  getAllContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
