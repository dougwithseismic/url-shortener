const options = {
  id: 1,
  name: 'Ad Copy Upgrader'
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
