const options = {
  id: 1,
  name: 'Ad Copy Upgrader',
  version: '1.0.0',
  platform: 'Google Ads',
  type: 'Script'
}

const getScriptContent = () => {
  return `const main = () => {
    console.log('main')
  }`
}

module.exports = {
  ...options,
  getScriptContent
}
