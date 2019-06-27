#!/usr/bin/env node

import program from 'commander'
import { getBabelLoaderIgnoreRegex } from './babel-loader-regex-builder'
import { ModulesChecker } from './modules-checker'
import IModuleCheckerConfig from './types/module-checker-config'

program
  .version('0.1.0')
  .command('check <path>')
  .description('Checks if all node_modules at <path> are ES5')
  .option('-v, --verbose', 'Log all messages (including modules that are ES5)')
  .option(
    '-r, --regex',
    'Get babel-loader exclude regex to ignore all node_modules except non-ES5 ones'
  )
  .action((path: string, cmd: any) => {
    let config: IModuleCheckerConfig = {}

    if (cmd.verbose) {
      config = {
        logEs5Packages: true
      }
    }

    const checker = new ModulesChecker(path, config)
    const nonEs5Dependencies = checker.checkModules()

    if (cmd.regex) {
      console.log('\n\nBabel-loader exclude regex:')
      console.log(
        '(You should manually remove Webpack and Babel plugins from this regex)\n'
      )
      console.log(getBabelLoaderIgnoreRegex(nonEs5Dependencies))
    }
  })

program.parse(process.argv)
