import { ModulesChecker } from './modules-checker'
import findUp from 'find-up'
import path from 'path'

interface CheckModulesOption {
  /** Path to package.json. If not specified, find it from current cwd */
  path?: string
  /** Check all node_modules instead of just direct dependencies. Default: false */
  checkAllNodeModules?: boolean
  /** Ignores webpack and babel dependencies. Default: true */
  ignoreBabelAndWebpackPackages?: boolean
}

export function checkModules({
  path: userPath,
  checkAllNodeModules = false,
  ignoreBabelAndWebpackPackages = true
}: CheckModulesOption) {
  const dir = userPath || path.dirname(findUp.sync('package.json'))

  const checker = new ModulesChecker(dir, {
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
