import chalk from 'chalk'
import { FirebaseManager } from '../firebaseAuth'
import { eventBus } from '../eventBus'

const db = FirebaseManager.initFirebase()

const init = () => {
  eventBus.emit('initialised', { test: 'hello innit' })

  eventBus.on('initialised', (test) => {
    console.log(test)
  })
}
const fetchLink = async (slug) => {
  // Checks firebase for slugs that match the users url input. Returns a hit if found, or null if not.
  const fetchedLink = await db
    .collection('links')
    .where('slug', '==', slug)
    .get()
    .then((snapshot) => snapshot.docs.map((doc) => doc.data()))
  console.log('Result of link search:', fetchedLink)
  return fetchedLink.length > 0 ? fetchedLink[0] : null
}

export const LinkManager = {
  init,
  fetchLink
}
