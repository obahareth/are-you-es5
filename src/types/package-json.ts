// Taken from:
// https://gist.github.com/iainreid820/5c1cc527fe6b5b7dba41fec7fe54bf6e
export interface IPackageJSON extends Object {
  readonly name: string

  readonly version?: string

  readonly description?: string

  readonly keywords?: string[]

  readonly homepage?: string

  readonly bugs?: string | IBugs

  readonly license?: string

  readonly author?: string | IAuthor

  readonly contributors?: string[] | IAuthor[]

  readonly files?: string[]

  readonly main?: string

  readonly bin?: string | IBinMap

  readonly man?: string | string[]

  readonly directories?: IDirectories

  readonly repository?: string | IRepository

  readonly scripts?: IScriptsMap

  readonly config?: IConfig

  readonly dependencies?: IDependencyMap

  readonly devDependencies?: IDependencyMap

  readonly peerDependencies?: IDependencyMap

  readonly optionalDependencies?: IDependencyMap

  readonly bundledDependencies?: string[]

  readonly engines?: IEngines

  readonly os?: string[]

  readonly cpu?: string[]

  readonly preferGlobal?: boolean

  readonly private?: boolean

  readonly publishConfig?: IPublishConfig
}

/**
 * An author or contributor
 */
export interface IAuthor {
  name: string
  email?: string
  homepage?: string
}

/**
 * A map of exposed bin commands
 */
export interface IBinMap {
  [commandName: string]: string
}

/**
 * A bugs link
 */
export interface IBugs {
  email: string
  url: string
}

export interface IConfig {
  name?: string
  config?: object
}

/**
 * A map of dependencies
 */
export interface IDependencyMap {
  [dependencyName: string]: string
}

/**
 * CommonJS package structure
 */
export interface IDirectories {
  lib?: string
  bin?: string
  man?: string
  doc?: string
  example?: string
}

export interface IEngines {
  node?: string
  npm?: string
}

export interface IPublishConfig {
  registry?: string
}

/**
 * A project repository
 */
export interface IRepository {
  type: string
  url: string
}

export interface IScriptsMap {
  [scriptName: string]: string
}
