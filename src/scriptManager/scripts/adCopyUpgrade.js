const options = {
  id: 1,
  name: 'Ad Copy Upgrader',
  version: '1.0.0'
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
