import { ModulesChecker } from './modules-checker'

interface CheckModulesOption {
  /** Path to package.json. If not specified, find it from current cwd */
  path?: string
  /** Check all node_modules instead of just direct dependencies. Default: false */
  checkAllNodeModules?: boolean
  /** Ignores webpack and babel dependencies. Default: true */
  ignoreBabelAndWebpackPackages?: boolean
}

export function checkModules({
  path = '',
  checkAllNodeModules = false,
  ignoreBabelAndWebpackPackages = true
}: CheckModulesOption) {
  const checker = new ModulesChecker(path, {
    checkAllNodeModules,
    ignoreBabelAndWebpackPackages,
    silent: true,
    logEs5Packages: false
  })
  return checker.getDeps()
}

export {
  buildExcludeRegexp,
  buildIncludeRegexp
} from './babel-loader-regex-builder'
