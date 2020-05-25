import { Logger } from '../src/logger'

describe('Logger', () => {
  it('should log by default', () => {
    const spy = jest.spyOn(global.console, 'log')
    const logger = new Logger({ silent: false })
    const message = 'Hello, have you received my call?'

    logger.log(message)

    expect(console.log).toHaveBeenLastCalledWith(message)
    spy.mockRestore()
  })

  it('should do nothing when configured to be silent', () => {
    const spy = jest.spyOn(global.console, 'log')
    const logger = new Logger({ silent: true })
    const message = 'Hello, have you received my call?'

    logger.log(message)

    expect(console.log).not.toHaveBeenLastCalledWith(message)
    spy.mockRestore()
  })
})
