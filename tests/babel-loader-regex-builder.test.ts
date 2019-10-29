import { getBabelLoaderIgnoreRegex } from '../src/babel-loader-regex-builder'

describe('getBabelLoaderIgnoreRegex', () => {
  it('returns a regex for ignoring dependencies', () => {
    const dependencies = ['dotenv', 'md5-file']
    const expectedRegex =
      '/[\\\\/]node_modules[\\\\/](?!(dotenv|md5-file)[\\\\/])/'

    expect(getBabelLoaderIgnoreRegex(dependencies)).toEqual(expectedRegex)
  })

  it('handles namespaced dependencies', () => {
    const dependencies = ['@react-pdf/renderer', 'dotenv', 'md5-file']
    const expectedRegex =
      '/[\\\\/]node_modules[\\\\/](?!(@react-pdf\\/renderer|dotenv|md5-file)[\\\\/])/'

    expect(getBabelLoaderIgnoreRegex(dependencies)).toEqual(expectedRegex)
  })
})
