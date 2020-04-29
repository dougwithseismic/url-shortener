// TODO: Different templates for requiring spreadsheet urls and options etc.
export const generateLoader = (apiKey, script, user) => {
  return `/* 
SCRIPTOMATICS.COM - PREMIUM GOOGLE ADS SCRIPTS & AUTOMATION
For ${user.firstName} ${user.lastName} - ${user.email}
${script.name}
Platform: ${script.platform}

Author: Doug Silkstone
Support: support@scriptomatics.com

Setup:  ${script.setupInstructions}


Scriptomatics.com
*/

function main() {
  scriptomaticLoader() // Loads script from Scriptomatics Server
}

function scriptomaticLoader() {
  var scriptLoad = UrlFetchApp.fetch('https://auth.scriptomatics.com/scripts/${apiKey}/${script.id}')
  if (JSON.parse(scriptLoad).response == false) {
    Logger.log(JSON.parse(scriptLoad).response)
    return
  }

  Logger.log(JSON.parse(scriptLoad).response)
  eval(JSON.parse(scriptLoad).scriptContent)
}
`
}
