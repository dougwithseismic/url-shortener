import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import 'babel-polyfill'
import chalk from 'chalk'
import { eventBus } from './eventBus'

import bodyParser from 'body-parser'

import { UserManager } from './userManager'

/*


*/

let port = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Delivers content
app.get('/init', async (req, res) => {
  res.send({ test: 'hello innit' })
})

app.post('/admin/orderPayment', async (req, res) => {
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(chalk.bgBlackBright('Scriptomatics :: Server Live on port', port))
})
