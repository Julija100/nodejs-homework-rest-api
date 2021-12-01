const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendEmail = async ({
  to,
  subject,
  text,
  html
}) => {
  await sgMail
    .send({
      from: process.env.SENDGRID_SENDER_EMAIL,
      to,
      subject,
      text,
      html
    })
}

module.exports = { sendEmail }
