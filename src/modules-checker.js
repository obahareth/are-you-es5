const { exec } = require('child_process')

const path = require('path')
const fs = require('fs')

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
    const dependencies = this.getDepsFromRootPackageJson()

    if (!dependencies) {
      return
    }

    dependencies.forEach(dependency => {
      const packagePath = path.join(nodeModulesDir, dependency)
      const packageJson = require(path.join(packagePath, 'package.json'))

      const mainScriptPath = this.getMainScriptPath(packageJson, packagePath)
      if (mainScriptPath) {
        this.checkScript(mainScriptPath, dependency)
      } else {
        console.log(
          `⚠️ ${dependency} was not checked because no entry script was found`
        )
      }
    })
  }

  getDepsFromRootPackageJson() {
    const packageJsonPath = path.join(this.dir, 'package.json')
    const packageJson = require(packageJsonPath)

    if (!packageJson) {
      console.error(`Failed to load package.json in ${this.dir}`)
      return null
    }

    return Object.keys(packageJson.dependencies)
  }

  getMainScriptPath(packageJson, dependencyPath) {
    if (packageJson.main) {
      const mainPath = path.join(dependencyPath, packageJson.main)

      if (!fs.existsSync(mainPath)) {
        // Some packages like uid have nonexistant paths in their main value
        // and have an index.js that should be loaded instead, so we'll look
        // for it if the main script doesn't exist

        const indexScriptPath = path.join(dependencyPath, 'index.js')

        if (fs.existsSync(indexScriptPath)) {
          return indexScriptPath
        }

        return null
      }

      const mainStats = fs.lstatSync(mainPath)

      if (mainStats.isFile()) {
        return mainPath
      }
      if (mainStats.isDirectory()) {
        const indexScriptPath = path.join(mainPath, 'index.js')

        if (fs.existsSync(indexScriptPath)) {
          return indexScriptPath
        }

        return null
      }
    } else {
      const indexScriptPath = path.join(dependencyPath, 'index.js')

      if (fs.existsSync(indexScriptPath)) {
        return indexScriptPath
      }
    }

    return null
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
