const Joi = require('joi')

const contactsValidation = Joi.object({
  name: Joi.string().min(1).max(40),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net'] },
    }),

  phone: Joi.string().min(7).max(20)
})

module.exports = contactsValidation
