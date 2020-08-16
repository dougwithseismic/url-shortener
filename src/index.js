import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import 'babel-polyfill'
import chalk from 'chalk'
import { eventBus } from './eventBus'

import { FirebaseManager } from './firebaseAuth'
import { LinkManager } from './linkManager'

import bodyParser from 'body-parser'

/*


*/

const redirectIfFalse =
  'https://www.notion.so/vnaut/Doug-Silkstone-Performance-Marketing-Fullstack-JavaScript-Developer-0718e15bf95a4d6393e8579f686cfbf8'

let port = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

LinkManager.init()

const antiSleep = () => {
  // Should keep the Heroku app from falling asleep :)
  var http = require('http')
  setInterval(() => {
    console.log('Keeping Server Alive')
    http.get('http://vnaut-link-shortener.herokuapp.com/heartbeat')
  }, 300000) // every 5 minutes (300000)
}

// Redirects elsewhere
app.get('/', async (req, res) => {
  console.log('Received request without slug - Redirecting')
  res.redirect(301, redirectIfFalse)
})

app.get('/Heartbeat', async (req, res) => {
  console.log('Heartbeat.')
  res.send(200)
})

// Main Query - When a user joins domain.com/:slug, check firebase for slug and if a redirect url exists for it, send traffic on. If not, redirect to somewhere else.
app.get('/:slug', async (req, res) => {
  const { slug } = req.params

  // Check Firebase collection and return output link, if match exists.

  const fetchedLink = await LinkManager.fetchLink(slug)
  fetchedLink ? res.redirect(301, fetchedLink.output) : res.redirect(301, redirectIfFalse)
})

app.listen(port, () => {
  console.log(chalk.bgBlackBright('URL Shortener :: Server Live on port', port))
})
