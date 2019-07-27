import * as acorn from 'acorn'
import mockFs from 'mock-fs'
import path from 'path'
import { ModulesChecker } from '../src/modules-checker'
import IModulesCheckerConfig from '../src/types/module-checker-config'
import { IPackageJSON } from '../src/types/package-json'

jest.mock('acorn')

afterEach(() => {
  mockFs.restore()
})

describe('static vars', () => {
  it('has a defaultConfig with logEs5Packages set to false', () => {
    expect(ModulesChecker.defaultConfig).toEqual({
      logEs5Packages: false
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
    const config: IModulesCheckerConfig = { logEs5Packages: true }

    expect(new ModulesChecker('', config).config).toEqual(config)
  })
})

describe('getDeps', () => {
  it('returns direct dependencies from package.json', () => {
    const deps = [
      'acorn',
      'commander',
      'is-even',
      'react',
      'uid',
      'underscore',
      'whatwg-fetch'
    ]
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root')
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(deps)
  })

  it('returns all node_modules when option is passed', () => {
    const deps = [
      'acorn',
      'commander',
      'is-buffer',
      'is-even',
      'is-number',
      'is-odd',
      'js-tokens',
      'kind-of',
      'loose-envify',
      'object-assign',
      'prop-types',
      'react',
      'react-is',
      'scheduler',
      'uid',
      'underscore',
      'whatwg-fetch'
    ]
    const modulesChecker = new ModulesChecker(
      path.join(__dirname, '/support/fixtures/root'),
      { checkAllNodeModules: true }
    )

    const parsedDeps = modulesChecker.getDeps()

    expect(parsedDeps).toEqual(deps)
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
})

describe('getMainScriptPath', () => {
  const dependencyPath = path.join(__dirname, 'dep/path')
  const modulesChecker = new ModulesChecker(dependencyPath)

  describe('when main is in package json', () => {
    let packageJson: IPackageJSON

    beforeAll(() => {
      packageJson = {
        main: 'test.js',
        name: 'test'
      }
    })

    describe('and it exists', () => {
      it("gets returned if it's a file", () => {
        const expectedPath = path.join(dependencyPath, 'test.js')

        mockFs({
          [expectedPath]: 'it exists'
        })

        const mainScriptPath = modulesChecker.getMainScriptPath(
          packageJson,
          dependencyPath
        )

        expect(mainScriptPath).toEqual(expectedPath)
      })

      it("returns main/index.js if it's a directory and index.js exists", () => {
        const mainDir = path.join(dependencyPath, packageJson.main)
        const expectedPath = path.join(mainDir, 'index.js')

        mockFs({
          [mainDir]: {
            'index.js': 'it exists'
          }
        })

        const mainScriptPath = modulesChecker.getMainScriptPath(
          packageJson,
          dependencyPath
        )

        expect(mainScriptPath).toEqual(expectedPath)
      })
    })

    describe("and it doesn't exist", () => {
      it('returns index.js if it exists', () => {
        const indexPath = path.join(dependencyPath, 'index.js')

        mockFs({
          [indexPath]: 'it exists'
        })

        const mainScriptPath = modulesChecker.getMainScriptPath(
          packageJson,
          dependencyPath
        )

        expect(mainScriptPath).toEqual(indexPath)
      })

      it("returns null if index.js doesn't exist", () => {
        const mainScriptPath = modulesChecker.getMainScriptPath(
          packageJson,
          dependencyPath
        )

        expect(mainScriptPath).toEqual(null)
      })
    })
  })

  describe('when main is *not* in package.json', () => {
    let packageJson: IPackageJSON

    beforeAll(() => {
      packageJson = {
        name: 'test'
      }
    })

    it('returns index.js if it exists', () => {
      const indexPath = path.join(dependencyPath, 'index.js')

      mockFs({
        [indexPath]: 'it exists'
      })

      const mainScriptPath = modulesChecker.getMainScriptPath(
        packageJson,
        dependencyPath
      )

      expect(mainScriptPath).toEqual(indexPath)
    })
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
})
