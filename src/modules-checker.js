const { exec } = require('child_process')

const path = require('path')

class ModulesChecker {
  constructor(dir, config) {
    if (config && typeof config === 'object') {
      this.config = config
    } else {
      this.config = ModulesChecker.defaultConfig
    }

    this.dir = dir
  }

  checkModules() {
    const nodeModulesDir = path.join(this.dir, 'node_modules')
    const dependencies = this.getDepsFromPackageJson()

    if (!dependencies) {
      return
    }

    dependencies.forEach(dependency => {
      const packagePath = path.join(nodeModulesDir, dependency)
      const packageJson = require(path.join(packagePath, 'package.json'))

      if (packageJson.main) {
        const mainScriptPath = path.join(packagePath, packageJson.main)

        this.checkScript(mainScriptPath, dependency)
      }
    })
  }

  getDepsFromPackageJson() {
    const packageJsonPath = path.join(this.dir, 'package.json')
    const packageJson = require(packageJsonPath)

    if (!packageJson) {
      console.error(`Failed to load package.json in ${this.dir}`)
      return null
    }

    return Object.keys(packageJson.dependencies)
  }

  checkScript(scriptPath, dependencyName) {
    // TODO: Check all scripts this script requires/imports
    exec(`es-check es5 ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        if (error.message.includes('ES version matching errors')) {
          console.log(`❌ ${dependencyName} is not ES5`)
        }

        // node couldn't execute the command
        else {
          console.error(error)
        }

        return
      }

      if (this.config.logEs5Packages) {
        console.log(`✅ ${dependencyName} is ES5`)
      }
    })
  }
}

ModulesChecker.defaultConfig = {
  logEs5Packages: false
}

module.exports = ModulesChecker
