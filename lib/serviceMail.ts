// --------------------
// File path: lib/serviceMail.ts
// author: Prathamesh Kothalkar
// --------------------

import nodemailer from 'nodemailer'

type SendMailArgs = {
  from?: string
  to: string
  subject: string
  html: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

export async function sendMail({ from, to, subject, html }: SendMailArgs) {
  const transport = getTransporter()

  const fromAddress = from || `College Task System <${process.env.SMTP_USER}>`

  return transport.sendMail({
    from: fromAddress,
    to,
    subject,
    html,
  })
}

export default sendMail
