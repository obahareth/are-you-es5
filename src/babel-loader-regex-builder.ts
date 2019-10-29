export function getBabelLoaderIgnoreRegex(dependencies: string[]) {
  dependencies = escapeNamespacedDependencies(dependencies)

  // [\\\\/] is a bit confusing but what it's doing is matching either a
  // backslash or forwards slash. Forwards slashes don't need to be
  // escaped inside a character group, and we need to escape the
  // backslash twice because we're in a string, and in a regex.
  //
  // If you console.log the regex it'll actually turn into:
  // [\\/]
  return `/[\\\\/]node_modules[\\\\/](?!(${dependencies.join('|')})[\\\\/])/`
}

function escapeNamespacedDependencies(dependencies: string[]): string[] {
  return dependencies.map(dep => dep.replace('/', '\\/'))
}
