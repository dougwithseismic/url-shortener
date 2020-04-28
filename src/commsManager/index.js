import sgMail from '@sendgrid/mail'

const test = () => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
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
  test
}
