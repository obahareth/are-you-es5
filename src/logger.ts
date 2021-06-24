import IModuleCheckerConfig from './types/module-checker-config'

export class Logger {
  constructor(private config: IModuleCheckerConfig) {
    this.config = config
  }

  public log(message: string) {
    if (!this.config.silent) {
      // Use console.warn so the messages go to stderr instead of stdout;
      // that makes it easier to use this from a shell script where you can
      // redirect stdout and everything is useful.
      console.warn(message)
    }
  }
}
