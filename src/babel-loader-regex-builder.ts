export function getBabelLoaderIgnoreRegex(dependencies: string[]) {
  return `/node_modules\/(?!(${dependencies.join('|')}))/`
}
