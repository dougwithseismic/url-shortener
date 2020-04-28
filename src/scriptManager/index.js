import requireDirectory from 'require-directory'
export const scriptLibrary = Object.values(requireDirectory(module, './scripts'))



