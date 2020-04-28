import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import 'babel-polyfill'
import chalk from 'chalk'
import { scriptLibrary } from './scriptManager/'
import { UserManager } from './userManager'
import { AccessManager } from './accessManager'
import fs from 'fs'

UserManager.init()

/*

User buys - Admin creates. User signs up.
---> userManager.createUser({...user, source: { type: 'web', }}) 
  ==> accessManager.generateKey()

User has purchased, User requests trial.
---> accessManager.grantAccess(apiKey, script, timeLength)
  ==> 

Script cancelled, Trial ends
---> accessManager.checkAccess / removeAccess
  ==> 

Script Runs
---> accessManager.hasAccess && scriptManager.serveContent


*/

// UserManager.generateNewTokenForUser("iQWUZPXxtOp8Gh3VhVUW")

// UserManager.createUser({ name: 'doug', email: 'doug@withseismic.com', password: '123' })
// UserManager.deleteUser().then((response) => console.log('resp : ', response))
// import "./app"

// UserManager.nukeUsers()
//   AccessManager.nukeAccess()
// AccessManager.grantAccess('DJDXQ4KFQ9MA95KC89KTVW22289S', 2, 30)

// AccessManager.createAccessPoint('R7VRPWT8T94K8TQE9DJ3AKRCQBWE')
//AccessManager.giveAccessToScript('R7VRPWT8T94K8TQE9DJ3AKRCQBWE', 2)

let port = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.urlencoded({ extended: true }))

// Serve Script + AUTH
app.get('/scripts/:apiKey/:scriptId', async (req, res) => {
  console.log(req.get('user-agent'))
  // 1. Check that API key is valid
  // 2. Check key has access to that script (and that request is coming from Google user-agent)
  // 3. Serve script

  const { apiKey } = req.params
  // !! Params are strings by default. fml
  const scriptId = parseInt(req.params.scriptId)
  const hasAccess = await AccessManager.checkAccess(apiKey, scriptId)

  if (!hasAccess) {
    res.send({
      status: false,
      response:
        'This API Key doesnt have access to this script - Double check and try again. Still an issue? Contact support@scriptomatics.com with this Error'
    })
    return
  } else if (!req.get('user-agent').includes('Google-Apps-Script')) {
    res.send({
      status: false,
      response: 'Invalid Request - Contact support@scriptomatics.com'
    })
    return
  }

  const scriptContent = scriptLibrary.find((script) => {
    return script.id == scriptId
  })


  console.log('Script Delivered:', scriptId, apiKey)
  res.send({
    status: true,
    response: `Script Loaded - ${scriptContent.name}`,
    scriptContent: scriptContent.getScriptContent()
  })
})

app.listen(port, () => {
  console.log(chalk.bgBlackBright('Scriptomatics :: Server Live on port', port))
})
