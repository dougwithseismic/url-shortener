import { initFirebase } from '../firebaseAuth.js'
import { UserManager } from './../userManager'
import uuidAPIKey from 'uuid-apikey'
import fbadmin from 'firebase-admin'
import chalk from 'chalk'

import skuMap from './skuMap.json'
import { eventBus } from '../eventBus'

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

  return sessions.length > 0 ? sessions[0] : null
}

const grantAccessOnOrder = async (order) => {
  /*
      When an order payment is processed, let's look at each item in that order and grant the customer access to those scripts.
      Products:
      
      - Single Script
      - Full Package - Everything
      - Account Shells
      - 

     */

  const customer = order.customer
  let token = await UserManager.getTokenFromCid(3015896727686)
  if (!token) {
    console.log(chalk.redBright('No Token found for user', customer.id))
    return
  }
  // Map SKU to scripts, then grant access to the customer

  for (const orderSku of order.skus) {
    const sku = skuMap.map.find((item) => item.sku == orderSku)
    console.log('sku :>> ', sku)

    for (const scriptId of sku.scripts) {
      await grantAccess(token.apiKey, scriptId, sku.duration)
    }

    if (sku !== undefined) {
      // eventBus.emit('grantAccess', token.apiKey, sku, sku.duration)
    }
  }
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
