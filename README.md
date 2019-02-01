# are-you-es5
![](https://img.shields.io/npm/v/are-you-es5.svg?style=popout)
![](https://img.shields.io/node/v/are-you-es5.svg?style=flat)

A package to help you find out which of your `node_modules` aren't written in ES5 so you can add them to your Webpack/Rollup/Parcel  transpilation steps. This is currently [limited to checking the entrypoint scripts only](https://github.com/obahareth/are-you-es5/issues/2), which **might** actually be enough of a check to determine if a package should be transpiled or not.

## Installing

You can install the package globally with 

```bash
npm install -g are-you-es5
```

or if you'd rather just run it immediately you can use npx:

```bash
npx are-you-es5 check /path/to/some/repo
```

### Aliasing
If you've installed it globally and find it tiresome to type `are-you-es5` a lot, you can alias it to `es5`:

#### Bash and Zsh

```bash
alias es5="are-you-es5"
```

#### Fish
```fish
alias es5 "are-you-es5"
```

## Usage

```
Usage: are-you-es5 check [options] <path>

Checks if all node_modules at <path> are ES5

Options:
  -a, --all    Log all messages (including modules that are ES5)
  -r, --regex  Get babel-loader exclude regex to ignore all node_modules except non-ES5 ones
  -h, --help   output usage information

```

### Example

```bash
are-you-es5 check /path/to/some/repo -r
❌ @babel/plugin-transform-block-scoping is not ES5
❌ @babel/plugin-transform-object-assign is not ES5
❌ @babel/plugin-transform-parameters is not ES5
❌ @babel/preset-react is not ES5
❌ @babel/register is not ES5
❌ @rails/webpacker is not ES5
❌ babel-plugin-lodash is not ES5
❌ lodash-webpack-plugin is not ES5

Babel-loader exclude regex:
(You should manually remove Webpack and Babel plugins from this regex)

/node_modules/(?![@babel/plugin-transform-block-scoping|@babel/plugin-transform-object-assign|@babel/plugin-transform-parameters|@babel/preset-react|@babel/register|@rails/webpacker|babel-plugin-lodash|lodash-webpack-plugin])/
```

## TODO

* [#2](https://github.com/obahareth/are-you-es5/issues/2) - Also check against all scripts required by entrypoint script, this should work for all JS module types.

## Credits

- [acorn](https://github.com/acornjs/acorn) - All the actual ES5 checking happens through acorn, this package wouldn't exist without it.
- [es-check](https://github.com/dollarshaveclub/es-check) - This whole package wouldn't have been possible if I hadn't come across es-check and learned from it.

