import requireDirectory from 'require-directory'
export const scriptLibrary = Object.values(requireDirectory(module, './scripts'))

const getScriptDetailsFromId = (scriptId) => {
  return scriptLibrary.find((script) => {
    return script.id == scriptId
  })
}

export const ScriptManager = {
  getScriptDetailsFromId
}
