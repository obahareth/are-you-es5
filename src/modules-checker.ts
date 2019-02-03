import * as acorn from 'acorn'
import fs from 'fs'
import path from 'path'
import { IPackageJSON } from './types/package-json'

export class ModulesChecker {
  private static defaultConfig = {
    logEs5Packages: false
  }

  constructor(
    private dir: string,
    private config: IModuleCheckerConfig = ModulesChecker.defaultConfig
  ) {
    this.dir = dir
    this.config = config
  }

  public checkModules(): string[] {
    const nodeModulesDir = path.join(this.dir, 'node_modules')
    const dependencies = this.getDepsFromRootPackageJson()

    if (!dependencies) {
      return
    }

    const nonEs5Dependencies: string[] = []

    dependencies.forEach(dependency => {
      const packagePath = path.join(nodeModulesDir, dependency)
      const packageJson = require(path.join(packagePath, 'package.json'))

      const mainScriptPath = this.getMainScriptPath(packageJson, packagePath)
      if (mainScriptPath) {
        const dependencyIsEs5 = this.isScriptEs5(mainScriptPath, dependency)
        if (!dependencyIsEs5) {
          nonEs5Dependencies.push(dependency)
        }
      } else {
        console.log(
          `⚠️ ${dependency} was not checked because no entry script was found`
        )
      }
    })

    return nonEs5Dependencies
  }

  public getDepsFromRootPackageJson() {
    const packageJsonPath = path.join(this.dir, 'package.json')
    const packageJson = require(packageJsonPath)

    if (!packageJson) {
      console.error(`Failed to load package.json in ${this.dir}`)
      return null
    }

    return Object.keys(packageJson.dependencies)
  }

  public getMainScriptPath(packageJson: IPackageJSON, dependencyPath: string) {
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

  public isScriptEs5(scriptPath: string, dependencyName: string) {
    // TODO: Check all scripts this script requires/imports
    const acornOpts: acorn.Options = { ecmaVersion: 5 }
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
