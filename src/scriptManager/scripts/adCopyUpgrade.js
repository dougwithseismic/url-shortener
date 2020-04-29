const options = {
  id: 1,
  name: 'Ad Copy Upgrader',
  version: '1.0.0',
  platform: 'Google Ads',
  type: 'Script',
  setupInstructions: `Here's where you'll put a quick set of instruction in plaintext for others to follow`
}

const getScriptContent = () => {
  return `Logger.log("IM HERE TO UPGRADE YOU")`
}

module.exports = {
  ...options,
  getScriptContent
}
