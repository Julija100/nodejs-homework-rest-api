const { Contact } = require('../model/contactsModel')

const getAllContacts = async () => {
  const contacts = await Contact.find()
  return contacts
}

module.exports = getAllContacts
