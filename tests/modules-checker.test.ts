import * as acorn from 'acorn'
import path from 'path'
import { ModulesChecker } from '../src/modules-checker'
import IModulesCheckerConfig from '../src/types/module-checker-config'
import { IPackageJSON } from '../src/types/package-json'
import {
  allDependencies,
  allDependenciesWithEntryPaths,
  directDependencies,
  subpackageDependencies,
  directDependenciesWithoutBabelAndWebpack,
  allDependenciesWithoutBabelAndWebpack
} from './support/helpers/dependencies'

jest.mock('acorn')

describe('static vars', () => {
  it('has a defaultConfig with logEs5Packages set to false', () => {
    expect(ModulesChecker.defaultConfig).toEqual({
      checkAllNodeModules: false,
      ignoreBabelAndWebpackPackages: true,
      logEs5Packages: false,
      silent: false
    })
  })
})

describe('constructor', () => {
  it('can be initialized with only a path to a directory', () => {
    const dir = 'path/to/dir'
    const absoluteDir = path.resolve(dir)
    expect(new ModulesChecker(dir).dir).toEqual(absoluteDir)
  })

  it("initializes with a default config if one hasn't been provided", () => {
    const dirName = 'path/to/dir'
    expect(new ModulesChecker(dirName).config).toEqual(
      ModulesChecker.defaultConfig
    )
  })

  it('can receive a second optional config argument that overrides default config', () => {
    const config: IModulesCheckerConfig = {
      checkAllNodeModules: false,
      ignoreBabelAndWebpackPackages: true,
      logEs5Packages: true, // This is the overrideen value
      silent: false
    }

    expect(new ModulesChecker('', config).config).toEqual(config)
  })
})

describe('getDeps', () => {
  it('returns direct dependencies from package.json', () => {
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root')
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(directDependenciesWithoutBabelAndWebpack)
  })

  it('returns direct dependencies including babel and webpack if ignoreBabelAndWebpackPackages is passed as false', () => {
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root'),
      { ignoreBabelAndWebpackPackages: false }
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(directDependencies)
  })

  it('returns all node_modules when option is passed', () => {
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root'),
      { checkAllNodeModules: true }
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(allDependenciesWithoutBabelAndWebpack)
  })

  it('returns all node_modules including babel and webpack when checkAllNodeModules is true and ignoreBabelAndWebpackPackages is false', () => {
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root'),
      { checkAllNodeModules: true, ignoreBabelAndWebpackPackages: false }
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(allDependencies)
  })
})

describe('isScriptEs5', () => {
  it('calls acorn', () => {
    const modulesChecker = new ModulesChecker(
      `${__dirname}/support/fixtures/root`
    )
    const scriptPath = path.join(
      __dirname,
      '/support/fixtures/root/node_modules/acorn/dist/acorn.js'
    )
    const dependencyName = 'acorn'

    modulesChecker.isScriptEs5(scriptPath, dependencyName)
    expect(acorn.parse).toHaveBeenCalled()
  })

  it('works for all the fixtures', () => {
    // Spy on console.log
    const spy = jest.spyOn(global.console, 'log')

    const modulesChecker = new ModulesChecker(
      `${__dirname}/support/fixtures/root`,
      { checkAllNodeModules: true, logEs5Packages: true }
    )

    allDependenciesWithEntryPaths.forEach(dependency => {
      modulesChecker.isScriptEs5(dependency.path, dependency.name)
      expect(console.log).toHaveBeenLastCalledWith(dependency.expectedOutput)
    })

    spy.mockRestore()
  })
})

describe('checkModules', () => {
  const modulesChecker = new ModulesChecker(
    path.join(__dirname, '/support/fixtures/root')
  )

  const mockGetDepsFromRootPackageJson = (dependencies: any[]) => {
    ModulesChecker.prototype.getDeps = jest
      .fn()
      .mockImplementationOnce(() => dependencies)
  }

  it('returns an empty array if no dependencies could be retrieved', () => {
    mockGetDepsFromRootPackageJson(null)

    expect(modulesChecker.checkModules()).toEqual([])
  })

  it('calls isScriptEs5 for each dependency', () => {
    const dependencies = ['acorn', 'commander']
    mockGetDepsFromRootPackageJson(dependencies)

    const mockIsScriptEs5 = (ModulesChecker.prototype.isScriptEs5 = jest
      .fn()
      .mockImplementationOnce(() => true))

    modulesChecker.checkModules()
    expect(mockIsScriptEs5).toHaveBeenCalledTimes(dependencies.length)
  })

  it('returns an array of non-es5 dependencies', () => {
    const dependencies = ['acorn', 'commander']
    mockGetDepsFromRootPackageJson(dependencies)

    const mockIsScriptEs5 = (ModulesChecker.prototype.isScriptEs5 = jest
      .fn()
      .mockImplementationOnce(() => true)).mockImplementationOnce(() => false)

    expect(modulesChecker.checkModules()).toEqual(['commander'])
  })

  it('works in monorepo subpackages', () => {
    mockGetDepsFromRootPackageJson(subpackageDependencies)

    const mockIsScriptEs5 = (ModulesChecker.prototype.isScriptEs5 = jest
      .fn()
      .mockImplementationOnce(() => true))

    const subPackageModulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root/packages/some-package')
    )

    subPackageModulesChecker.checkModules()
    expect(mockIsScriptEs5).toHaveBeenCalledTimes(subpackageDependencies.length)
  })
})
