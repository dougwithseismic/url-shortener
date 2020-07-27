import chalk from 'chalk'
import { eventBus } from '../eventBus'

const init = () => {
  eventBus.emit('initialised', { test: 'hello innit' })
  
  eventBus.on('initialised', (test) => {
    console.log(test)
  })
}

export const SerpManager = {
  init
}
