import { Logger } from '../src/logger'

describe('when silent config is present', () => {
  it('should not log', () => {
    const spy = jest.spyOn(global.console, 'log')
    const logger = new Logger({ silent: true })
    const message = 'Hello, have you received my call?'

    logger.log(message)

    expect(console.log).not.toHaveBeenLastCalledWith(message)
    spy.mockRestore()
  })
})

describe('when silent config is not present', () => {
  it('should log', () => {
    const spy = jest.spyOn(global.console, 'log')
    const logger = new Logger({ silent: false })
    const message = 'Hello, have you received my call?'

    logger.log(message)

    expect(console.log).toHaveBeenLastCalledWith(message)
    spy.mockRestore()
  })
})
