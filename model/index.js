const fs = require("fs/promises");
// const contacts = require('./contacts.json');
const contactsPath = require("./contactsPath");
const getAllContacts = require("../utils/getAllContacts");

const listContacts = async () => await getAllContacts(contactsPath);

const getContactById = async (contactId) => {
  const allContacts = await getAllContacts();

  const necessaryContact = allContacts.find(
    ({ id }) => id.toString() === contactId.toString()
  );
  if (necessaryContact) {
    return necessaryContact;
  } else {
    return null;
  }
};

const removeContact = async (contactId) => {
  const prevContact = await getAllContacts();
  const deletedContact = prevContact.find(
    ({ id }) => id.toString() === contactId.toString()
  );

  if (!deletedContact) {
    return null;
  }
  const newContact = prevContact.filter(
    ({ id }) => id.toString() !== contactId.toString()
  );
  await fs.writeFile(contactsPath, JSON.stringify(newContact, null, 2));

  return newContact;
};

const addContact = async (body) => {};

const updateContact = async (contactId, body) => {};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
