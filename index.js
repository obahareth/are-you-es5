#!/usr/bin/env node

const program = require('commander')
const ModulesChecker = require('./src/modules-checker')
const {
  getBabelLoaderIgnoreRegex
} = require('./src/babel-loader-regex-builder')

program
  .version('0.1.0')
  .command('check <path>')
  .description('Checks if all node_modules at <path> are ES5')
  .option('-a, --all', 'Log all messages (including modules that are ES5)')
  .option(
    '-r, --regex',
    'Get babel-loader exclude regex to ignore all node_modules except non-ES5 ones'
  )
  .action((path, cmd) => {
    let config = null

    if (cmd.all) {
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
