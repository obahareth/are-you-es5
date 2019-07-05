import * as acorn from 'acorn'
import flatten from 'array-flatten'
import fs, { lstatSync } from 'fs'
import path from 'path'

import IModuleCheckerConfig from './types/module-checker-config'
import { IPackageJSON } from './types/package-json'

export class ModulesChecker {
  public static readonly defaultConfig: IModuleCheckerConfig = {
    logEs5Packages: false
  }

  constructor(
    readonly dir: string,
    readonly config: IModuleCheckerConfig = ModulesChecker.defaultConfig
  ) {
    this.dir = path.resolve(dir)
    this.config = { ...ModulesChecker.defaultConfig, ...config }
  }

  public checkModules(): string[] {
    const nodeModulesDir = path.join(this.dir, 'node_modules')
    const dependencies = this.getDeps()

    if (!dependencies) {
      return []
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

  public getDeps(): string[] | null {
    if (!this.config.checkAllNodeModules) {
      return this.getDepsFromRootPackageJson()
    } else {
      return this.getAllNodeModules()
    }

    return null
  }

  public getMainScriptPath(packageJson: IPackageJSON, dependencyPath: string) {
    if (packageJson.main) {
      return this.getMainScriptFromPackageJson(packageJson, dependencyPath)
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

  private getMainScriptFromPackageJson(
    packageJson: IPackageJSON,
    dependencyPath: string
  ) {
    const mainPath = path.join(dependencyPath, packageJson.main)

    if (!fs.existsSync(mainPath)) {
      // Some packages like uid have nonexistent paths in their main value
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

    // If it's a directory, return dir/index.js if it exists
    if (mainStats.isDirectory()) {
      const indexScriptPath = path.join(mainPath, 'index.js')

      if (fs.existsSync(indexScriptPath)) {
        return indexScriptPath
      }
    }

    return null
  }

  private getDepsFromRootPackageJson() {
    const packageJsonPath = path.join(this.dir, 'package.json')
    const packageJson = require(packageJsonPath)

    if (!packageJson) {
      console.error(`Failed to load package.json in ${this.dir}`)
      return null
    }

    return Object.keys(packageJson.dependencies)
  }

  private getAllNodeModules(): string[] | null {
    const nodeModulesPath = path.join(this.dir, 'node_modules')

    if (fs.existsSync(nodeModulesPath)) {
      const isDirectory = (source: string): boolean =>
        lstatSync(source).isDirectory()

      const getDirectories = (source: string): any[] => {
        return fs
          .readdirSync(source)
          .map(name => path.join(source, name))
          .filter(isDirectory)
      }

      const getLeafFolderName = (fullPath: string): string => {
        const needle = 'node_modules/'
        const indexOfLastSlash = fullPath.lastIndexOf(needle)
        return fullPath.substr(indexOfLastSlash + needle.length)
      }

      let nodeModules = getDirectories(nodeModulesPath)
        .filter(entry => {
          const leafFolderName = getLeafFolderName(entry)
          return !leafFolderName.startsWith('.')
        })
        .map(entry => {
          // If this is a scope (folder starts with @), return all
          // folders inside it (scoped packages)
          if (/@.*$/.test(entry)) {
            return getDirectories(entry)
          } else {
            return entry
          }
        })

      // Remove path from all strings
      // e.g. turn bla/bla/node_modules/@babel/core
      // into @babel/core
      nodeModules = flatten(nodeModules).map((entry: string) =>
        getLeafFolderName(entry)
      )

      return nodeModules
    }

    console.error(`Failed to find node_modules at ${this.dir}`)
    return null
  }
}
