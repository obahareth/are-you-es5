import path from 'path'
import IDependencyWithPathAndOutput from '../types/dependency-with-path-and-output'

export const directDependencies = [
  'acorn',
  'commander',
  'is-even',
  'react',
  'uid',
  'whatwg-fetch'
]

export const subpackageDependencies = ['acorn', 'underscore']

export const allDependencies = [
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
  'whatwg-fetch'
]

export const allDependenciesWithEntryPaths: IDependencyWithPathAndOutput[] = [
  {
    expectedOutput: '✅ acorn is ES5',
    name: 'acorn',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/acorn/dist/acorn.js'
    )
  },
  {
    expectedOutput: '✅ commander is ES5',
    name: 'commander',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/commander/index.js'
    )
  },
  {
    expectedOutput: '✅ is-buffer is ES5',
    name: 'is-buffer',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/is-buffer/index.js'
    )
  },
  {
    expectedOutput: '✅ is-even is ES5',
    name: 'is-even',
    path: path.join(__dirname, '../fixtures/root/node_modules/is-even/index.js')
  },
  {
    expectedOutput: '✅ is-number is ES5',
    name: 'is-number',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/is-number/index.js'
    )
  },
  {
    expectedOutput: '✅ is-odd is ES5',
    name: 'is-odd',
    path: path.join(__dirname, '../fixtures/root/node_modules/is-odd/index.js')
  },
  {
    expectedOutput: '✅ js-tokens is ES5',
    name: 'js-tokens',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/js-tokens/index.js'
    )
  },
  {
    expectedOutput: '✅ kind-of is ES5',
    name: 'kind-of',
    path: path.join(__dirname, '../fixtures/root/node_modules/kind-of/index.js')
  },
  {
    expectedOutput: '✅ loose-envify is ES5',
    name: 'loose-envify',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/loose-envify/index.js'
    )
  },
  {
    expectedOutput: '✅ object-assign is ES5',
    name: 'object-assign',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/object-assign/index.js'
    )
  },
  {
    expectedOutput: '✅ prop-types is ES5',
    name: 'prop-types',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/prop-types/index.js'
    )
  },
  {
    expectedOutput: '✅ react is ES5',
    name: 'react',
    path: path.join(__dirname, '../fixtures/root/node_modules/react/index.js')
  },
  {
    expectedOutput: '✅ react-is is ES5',
    name: 'react-is',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/react-is/index.js'
    )
  },
  {
    expectedOutput: '✅ scheduler is ES5',
    name: 'scheduler',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/scheduler/index.js'
    )
  },
  {
    expectedOutput: '✅ uid is ES5',
    name: 'uid',
    path: path.join(__dirname, '../fixtures/root/node_modules/uid/index.js')
  },
  {
    expectedOutput: '✅ whatwg-fetch is ES5',
    name: 'whatwg-fetch',
    path: path.join(
      __dirname,
      '../fixtures/root/node_modules/whatwg-fetch/dist/fetch.umd.js'
    )
  }
]
