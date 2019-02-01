const getBabelLoaderIgnoreRegex = dependencies => {
  return `/node_modules\/(?![${dependencies.join('|')}])/`
}

module.exports = {
  getBabelLoaderIgnoreRegex
}
