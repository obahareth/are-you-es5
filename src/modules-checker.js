const acorn = require('acorn')
const fs = require('fs')
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
    const acornOpts = {
      ecmaVersion: '5',
      silent: true
    }
    const code = fs.readFileSync(scriptPath, 'utf8')

    try {
      acorn.parse(code, acornOpts)
    } catch (err) {
      console.log(`❌ ${dependencyName} is not ES5`)
      return false
    }

    if (this.config.logEs5Packages) {
      console.log(`✅ ${dependencyName} is ES5`)
    }

    return true
  }
}

ModulesChecker.defaultConfig = {
  logEs5Packages: false
}

module.exports = ModulesChecker
