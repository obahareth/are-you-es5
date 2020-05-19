import * as acorn from 'acorn'
import flatten from 'array-flatten'
import fs, { lstatSync } from 'fs'
import path from 'path'

import IModuleCheckerConfig from './types/module-checker-config'
import { IPackageJSON } from './types/package-json'

export class ModulesChecker {
  public static readonly defaultConfig: IModuleCheckerConfig = {
    checkAllNodeModules: false,
    ignoreBabelAndWebpackPackages: true,
    logEs5Packages: false,
    silent: false
  }

  constructor(
    readonly dir: string,
    readonly config: IModuleCheckerConfig = ModulesChecker.defaultConfig
  ) {
    this.dir = path.resolve(dir)
    this.config = { ...ModulesChecker.defaultConfig, ...config }
  }

  public checkModules(): string[] {
    return this.parseDeps().es6Modules
  }

  public parseDeps(): {
    es5Modules: string[]
    es6Modules: string[]
    ignored: string[]
  } {
    const dependencies = this.getDeps() || []

    const es5Modules: string[] = []
    const es6Modules: string[] = []
    const ignored: string[] = []

    dependencies.forEach(dependency => {
      try {
        const dependencyIsEs5 = this.isScriptEs5(
          require.resolve(dependency, { paths: [this.dir] }),
          dependency
        )
        dependencyIsEs5
          ? es5Modules.push(dependency)
          : es6Modules.push(dependency)
      } catch (err) {
        ignored.push(dependency)
      }
    })

    return { es5Modules, es6Modules, ignored }
  }

  public getDeps(): string[] | null {
    let deps = this.getDepsFromRootPackageJson()

    if (this.config.checkAllNodeModules) {
      deps.push(...this.getAllNodeModules())
    }

    if (this.config.ignoreBabelAndWebpackPackages) {
      deps = this.dependenciesWithoutBabelAndWebpackPages(deps)
    }

    // convert to and from a Set to remove duplicates
    return [...new Set(deps)].sort()
  }

  public isScriptEs5(scriptPath: string, dependencyName: string) {
    // TODO: Check all scripts this script requires/imports
    const acornOpts: acorn.Options = { ecmaVersion: 5 }
    const code = fs.readFileSync(scriptPath, 'utf8')

    try {
      acorn.parse(code, acornOpts)
    } catch (err) {
      this.log(`❌ ${dependencyName} is not ES5`)
      return false
    }

    if (this.config.logEs5Packages) {
      this.log(`✅ ${dependencyName} is ES5`)
    }

    return true
  }

  private dependenciesWithoutBabelAndWebpackPages(dependencies: string[]) {
    const ignoreRegex = /(babel|webpack)|(loader$)/

    return dependencies.filter(dep => !ignoreRegex.test(dep))
  }

  private getDepsFromRootPackageJson() {
    const packageJsonPath = path.join(this.dir, 'package.json')
    const packageJson = require(packageJsonPath)

    if (!packageJson) {
      throw new Error(`Failed to load package.json in ${this.dir}`)
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

    throw new Error(`Failed to find node_modules at ${this.dir}`)
  }

  private log(message: string) {
    if (!this.config.silent) {
      console.log(message)
    }
  }
}
