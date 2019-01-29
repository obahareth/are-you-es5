#!/usr/bin/env node

const program = require('commander')
const ModulesChecker = require('./src/modules-checker')

program
  .version('0.1.0')
  .command('check <path>')
  .description('Checks if all node_modules at <path> are ES5')
  .option('-a, --all', 'Log all messages (including modules that are ES5)')
  .action((path, cmd) => {
    let config = null

    if (cmd.all) {
      config = {
        logEs5Packages: true
      }
    }

    const checker = new ModulesChecker(path, config)
    checker.checkModules();
  })


program.parse(process.argv)