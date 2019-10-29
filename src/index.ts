#!/usr/bin/env node

import program from 'commander'

import { getBabelLoaderIgnoreRegex } from './babel-loader-regex-builder'
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
    '-r, --regex',
    'Get babel-loader exclude regex to ignore all node_modules except non-ES5 ones, by default does not show any babel or webpack modules, use with --no-regex-filtering if you want to see everything'
  )
  .action((path: string, cmd: any) => {
    const config: IModuleCheckerConfig = {
      checkAllNodeModules: cmd.all === true,
      ignoreBabelAndWebpackPackages: cmd.regexFiltering,
      logEs5Packages: cmd.verbose === true
    }

    const checker = new ModulesChecker(path, config)
    const nonEs5Dependencies = checker.checkModules()

    if (cmd.regex) {
      console.log('\n\nBabel-loader exclude regex:')
      console.log(getBabelLoaderIgnoreRegex(nonEs5Dependencies))
    }
  })

program.parse(process.argv)
