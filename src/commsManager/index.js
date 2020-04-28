import sgMail from '@sendgrid/mail'
import { eventBus } from './../eventBus'

const init = () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)

  eventBus.on('sendApiKeyToUser', async (user) => {
    console.log('Sending API Key to Customer :>> ', user.cid)
    const msg = {
      to: user.email,
      from: 'doug@scriptomatics.com',
      fromname: 'Doug - Scriptomatics.com',
      templateId: 'd-fe30a1c5cbb34efbbbfe69ed9e45e3e8',
      dynamic_template_data: {
        name: user.firstName,
        apiKey: user.token.apiKey
      }
    }
    await sgMail.send(msg)
  })
}

const test = () => {
  const msg = {
    to: 'doug@withseismic.com',
    from: 'doug@scriptomatics.com',
    templateId: 'd-fe30a1c5cbb34efbbbfe69ed9e45e3e8',
    dynamic_template_data: {
      name: 'Doug',
      apiKey: 'EC2PCS-HQHMMY-WGM662-XHG1JQ-WZ34'
    }
  }
  sgMail.send(msg)
}

export const CommsManager = {
  init,
  test
}
