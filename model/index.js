const { Contact } = require('../model/contactsModel')

const getAllContacts = require('../utils/getAllContacts')

const listContacts = () => {
  return getAllContacts()
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
    await Contact.deleteOne({ _id: contactId })
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
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}
