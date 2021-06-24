#!/usr/bin/env node

import program from 'commander'

import { getBabelLoaderIgnoreRegex } from './babel-loader-regex-builder'
import CLI_ERRORS from './cli-errors'
import { Logger } from './logger'
import { ModulesChecker } from './modules-checker'
import IModuleCheckerConfig from './types/module-checker-config'

program
  .version('1.3.3')
  .command('check <path>')
  .description(
    'Checks if all node_modules (including monorepos) at <path> are ES5'
  )
  .option(
    '-a, --all',
    'Check all node_modules instead of just direct dependencies'
  )
  .option('-v, --verbose', 'Log all messages (including modules that are ES5)')
  .option(
    '--no-regex-filtering',
    'Stops all filtering on babel-loader exclude regex (does not hide anything) '
  )
  .option(
    '-l, --list',
    "Return a JSON.stringify'd array of modules for use with vue.config.js in transpileDependencies"
  )
  .option(
    '-r, --regex',
    'Get babel-loader exclude regex to ignore all node_modules except non-ES5 ones, by default does not show any babel or webpack modules, use with --no-regex-filtering if you want to see everything'
  )
  .option(
    '--silent',
    'Do not log messages in the console (except regex if --regex is used)'
  )
  .action((path: string, cmd: any) => {
    const config: IModuleCheckerConfig = {
      checkAllNodeModules: cmd.all === true,
      ignoreBabelAndWebpackPackages: cmd.regexFiltering,
      logEs5Packages: cmd.verbose === true,
      silent: cmd.silent === true
    }

    const checker = new ModulesChecker(path, config)
    const logger = new Logger(config)
    const { es6Modules } = checker.checkModules()

    if (cmd.regex) {
      console.log('\n\nBabel-loader exclude regex:')
      console.log(getBabelLoaderIgnoreRegex(es6Modules))
    }
    if (cmd.list) {
      console.log('\n\nArray:');
      console.log(JSON.stringify(es6Modules));
    }

    if (es6Modules.length !== 0) {
      const error = CLI_ERRORS.nonES5DependenciesDetected
      logger.log(error.message)

      process.exitCode = error.code
    }
  })

program.parse(process.argv)
