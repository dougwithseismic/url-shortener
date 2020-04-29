import { initFirebase } from '../firebaseAuth.js'
import chalk from 'chalk'
import userProfile from './user'
import { eventBus } from '../eventBus'
import bcrypt from 'bcrypt'
import uuidAPIKey from 'uuid-apikey'

const db = initFirebase()

const init = () => {
  // Subscribes to lobbyGroups collection, and creates a default one if it doesnt exist.
  db.collection('users').onSnapshot((snapshot) => {
    let userContainer = []
    if (snapshot.size) {
      userContainer = snapshot.docs.map((doc) => doc.data())
    } else {
      console.log(chalk.cyanBright('No Users Found..'))
    }

    // subscribe to updates
    snapshot.docChanges().forEach((change) => {
      eventBus.emit('userChange', {
        change: change.type,
        data: { ...change.doc.data(), uid: change.doc.id }
      })
    })

    return userContainer
  })

  eventBus.on('createCustomer', async (customerDetails) => {
    await createUser(customerDetails).then((user) => {})
  })
}

const findUser = async (query, value) => {
  const foundUser = await db
    .collection('users')
    .where(query, '==', value)
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.data()))

  return foundUser.length > 0 ? foundUser[0] : null
}

const createUser = async (user) => {
  let userContainer = null
  console.log('Create User Request:', user.email)
  const existingUser = await findUser('email', user.email)

  if (existingUser) {
    console.log(chalk.red('User Already Exists: Skipping creation'))
    return existingUser
  } else {
    console.log('User not found: Creating User', user.email)
    user.token = uuidAPIKey.create({ noDashes: false })

    const saltRounds = 5
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
      // Store hash in your password DB.
      user.password = hash
      try {
        db
          .collection('users')
          .add({
            ...userProfile,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            token: user.token,
            cid: user.id // Shopify Customer Id. Int
          })
          .then(async (ref) => {
            userContainer = await ref.get()
            eventBus.emit('sendApiKeyToUser', userContainer.data())
          })
      } catch (error) {
        console.log('error :>> ', error)
      }
    })
  }
  return userContainer
}

const deleteUser = async (userId) => {
  // Add error handling..
  return userId === undefined
    ? 'Cannot delete user - userId needed'
    : db.collection('users').doc(userId).get().then((doc) => doc.ref.delete())
}

const updateUser = async (userId, update = {}) => {
  await db.collection('users').doc(userId).update(update)
  return userId
}

const nukeUsers = async () => {
  const res = await db.collection('users').get()
  return res.docs.forEach((doc) => doc.ref.delete())
}

const generateNewTokenForUser = async (uid) => {
  // TODO: When a new key gets generated, how will we pass on access from the old key?
  // EMIT AN EVENT!
  const newKey = uuidAPIKey.create({ noDashes: true })
  try {
    await db
      .collection('users')
      .doc(uid)
      .get()
      .then((doc) => doc.ref.update({ token: newKey }))
      .then(() => console.log('Updated Token: ', newKey))
  } catch (error) {
    console.log('error :>> ', error)
  }

  // .update({ token: newKey })
  // .then(() => console.log('Updated Token: ', newKey))
}

const getTokenFromApiKey = async (apiKey) => {
  console.log('Getting Token from API Key:', apiKey)

  const token = await db
    .collection('users')
    .where('token.apiKey', '==', apiKey)
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.data()))

  return token.length > 0 ? token[0].token : null
}

const getTokenFromCid = async (cid) => {
  console.log('Getting Token from Customer Id:', cid)

  const token = await db
    .collection('users')
    .where('cid', '==', cid)
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.data()))

  return token.length > 0 ? token[0].token : null
}

export const UserManager = {
  init,
  createUser,
  deleteUser,
  updateUser,
  nukeUsers,
  generateNewTokenForUser,
  getTokenFromApiKey,
  getTokenFromCid
}
