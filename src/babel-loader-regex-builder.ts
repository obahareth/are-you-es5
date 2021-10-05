const crossEnvSlash = '[\\/]'
const nodeModules = `${crossEnvSlash}node_modules${crossEnvSlash}`
const escape = (dep: string) => dep.replace('/', '\\/')

/** Create a string regexp from a list of dependencies */
export function getBabelLoaderIgnoreRegex(dependencies: string[], additionalModules: string[] = []) {
  // [\\\\/] is a bit confusing but what it's doing is matching either a
  // backslash or forwards slash. Forwards slashes don't need to be
  // escaped inside a character group, and we need to escape the
  // backslash twice because we're in a string, and in a regex.
  //
  // If you console.log the regex it'll actually turn into:
  // [\\/]
  //
  // Printing out a regexp isn't proposing this escaped
  return `/[\\\\/]node_modules[\\\\/](?!(${[...additionalModules, ...dependencies]
    .map(escape)
    .join('|')})[\\\\/])/`
}

/**
 * Create a Regexp that includes a list of dependencies
 * @param dependencies list of dependencies to include
 */
export function buildIncludeRegexp(dependencies: string[], additionalModules: string[] = []) {
  return new RegExp(
    `${nodeModules}?(${[...additionalModules, ...dependencies].map(escape).join('|')})${crossEnvSlash}`
  )
}

/**
 * Create a Regexp that excludes a list of dependencies
 * @param dependencies list of dependencies to excludes
 */
export function buildExcludeRegexp(dependencies: string[], additionalModules: string[] = []) {
  return new RegExp(
    `${nodeModules}(?!(${[...additionalModules, ...dependencies].map(escape).join('|')})${crossEnvSlash})`
  )
}
