import IModuleCheckerConfig from './types/module-checker-config'

export class Logger {
  constructor(private config: IModuleCheckerConfig) {
    this.config = config
  }

  public log(message: string) {
    if (!this.config.silent) {
      console.log(message)
    }
  }
}
