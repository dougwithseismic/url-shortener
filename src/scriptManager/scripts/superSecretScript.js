const options = {
  id: 2,
  name: 'Super Secret Script',
  version: '1.0.1'
}

const getScriptContent = () => {
  return `
  
  Logger.log('ITS ALIVE')
  
  `
}

module.exports = {
  ...options,
  getScriptContent
}
