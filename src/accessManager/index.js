import { initFirebase } from '../firebaseAuth.js'
import { UserManager } from './../userManager'
import chalk from 'chalk'

import { skuMap } from './skuMap'
import { eventBus } from '../eventBus'
import { CommsManager } from '../commsManager/index.js'
import { ScriptManager } from '../scriptManager/index.js'

const db = initFirebase()

const nukeAccess = async () => {
  const res = await db.collection('sessions').get()
  return res.docs.forEach((doc) => doc.ref.delete())
}

const grantAccess = async (apiKey, scriptId, duration) => {
  // Check whether API key has an access session already -if it does, add the duration (days). If not, create a new session.
  const sessions = await checkAccess(apiKey, scriptId)
  const getToken = await UserManager.getTokenFromApiKey(apiKey)

  if (!getToken) {
    console.log(chalk.red('API Key not found - Cannot grant access'))
    return
  }

  if (sessions) {
    let currentExpiry = sessions.data.accessExpires.toDate()
    let accessExpires = new Date(currentExpiry.setDate(currentExpiry.getDate() + duration + 1))
    accessExpires.setHours(0, 0, 0, 0)
    await db.collection('sessions').doc(sessions.id).update({ accessExpires }).then(() => {
      console.log(`Added ${duration} days of access to script ${scriptId} - New session Expiration`, accessExpires)
    })
  } else {
    // Create the session with a set duration
    let d = new Date()
    d.setDate(d.getDate() + duration + 1)
    d.setHours(0, 0, 0, 0)

    await db
      .collection('sessions')
      .add({ scriptId, accessExpires: d, token: getToken })
      .then(() =>
        console.log(chalk.greenBright(`Granted ${getToken.apiKey} access to ${scriptId} for ${duration} days`))
      )
  }
}

const checkAccess = async (tokenValue, scriptId, tokenType = 'apiKey') => {
  const sessions = await db
    .collection('sessions')
    .where(`token.${tokenType}`, '==', tokenValue)
    .where('scriptId', '==', scriptId)
    .get()
    .then((snapshot) =>
      snapshot.docs.map((doc) => {
        return {
          data: doc.data(),
          id: doc.id
        }
      })
    )

  const checked = sessions.length > 0 ? sessions[0] : null
  if (!checked) {
    return null
  }

  let now = new Date()
  let expiry = checked.data.accessExpires.toDate()

  if (now > expiry) {
    return null
  }

  return sessions.length > 0 ? sessions[0] : null
}

const grantAccessOnOrder = async (order) => {
  const customer = order.customer
  console.log(chalk.greenBright('Processing Order', order.id))

  let token = await UserManager.getTokenFromCid(customer.id)
  if (!token) {
    console.log(chalk.redBright('No Token found for user - Does user exist?', customer.id))
    return
  }
  // Map SKU to scripts, then grant access to the customer

  let productBucket = []

  for (const orderSku of order.skus) {
    const sku = skuMap.map.find((item) => item.sku == orderSku)
    if (sku == undefined) {
      console.log('Error: SKU Not Found!')
      return false
    }

    for (const scriptId of sku.scripts) {
      // Grant access to each script in the order...
      productBucket.push({ id: scriptId, duration: sku.duration })
      await grantAccess(token.apiKey, scriptId, sku.duration)
    }
  }

  // ... then email a confirmation to customer!
  // https://github.com/sendgrid/email-templates/blob/master/dynamic-templates/receipt/receipt.html

  console.log(chalk.greenBright('Access Granted: Emailing Customer', customer.id))

  const fullDetails = productBucket.map((product) => {
    const scriptDetails = ScriptManager.getScriptDetailsFromId(product.id)
    delete scriptDetails.getScriptContent // Don't go breaking my heart

    return {
      ...scriptDetails,
      duration: product.duration,
      downloadLink: `https://auth.scriptomatics.com/downloads/scripts/${customer.id}/${token.apiKey}/${product.id}`
    }
  })

  const payload = {
    to: customer.email,
    from: {
      email: 'doug@scriptomatics.com',
      name: 'Doug at Scriptomatics.com'
    },
    templateId: 'd-d75fd6623ee9414e85285c0b7ccb8485',
    dynamic_template_data: {
      customer: { id: customer.id, firstName: customer.first_name, lastName: customer.last_name },
      apiKey: token.apiKey,
      items: fullDetails
    }
  }

  CommsManager.sendTemplate(payload, customer)
}

const init = () => {
  eventBus.on('grantAccess', async (apiKey, scriptId, duration) => {
    // Check whether API key has an access session already -if it does, add the duration (days). If not, create a new session.
    const sessions = await checkAccess(apiKey, scriptId)
    const getToken = await UserManager.getTokenFromApiKey(apiKey)

    if (!getToken) {
      console.log(chalk.red('API Key not found - Cannot grant access'))
      return
    }

    if (sessions) {
      let currentExpiry = sessions.data.accessExpires.toDate()
      let accessExpires = new Date(currentExpiry.setDate(currentExpiry.getDate() + duration + 1))
      accessExpires.setHours(0, 0, 0, 0)
      db.collection('sessions').doc(sessions.id).update({ accessExpires }).then(() => {
        console.log(`Added ${duration} days to time - New session Expiration`, accessExpires)
      })
    } else {
      // Create the session with a set duration
      let d = new Date()
      d.setDate(d.getDate() + duration + 1)
      d.setHours(0, 0, 0, 0)

      db
        .collection('sessions')
        .add({ scriptId, accessExpires: d, token: getToken })
        .then(() =>
          console.log(chalk.greenBright(`Granted ${getToken.apiKey} access to ${scriptId} for ${duration} days`))
        )
    }
  })
}

export const AccessManager = {
  init,
  nukeAccess,
  grantAccess,
  grantAccessOnOrder,
  checkAccess
}
