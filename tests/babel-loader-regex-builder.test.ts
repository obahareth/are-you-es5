import {
  getBabelLoaderIgnoreRegex,
  buildIncludeRegexp,
  buildExcludeRegexp
} from '../src/babel-loader-regex-builder'

describe('babel-loader-regex-builder', () => {
  describe('getBabelLoaderIgnoreRegex', () => {
    it('returns a regex as string for ignoring dependencies', () => {
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

  describe('buildIncludeRegexp', () => {
    it('should return a regexp matching /node_modules/abc/', () => {
      const dependencies = ['abc']
      const actual = buildIncludeRegexp(dependencies)
      expect(actual).toBeInstanceOf(RegExp)
      console.log(actual.toString())
      expect(actual.test('/node_modules/abc/')).toBeTruthy()
    })

    it('returns a regex matching /node_modules/@abc/def/ (namespaced dep)', () => {
      const dependencies = ['@abc/def']
      const actual = buildIncludeRegexp(dependencies)
      expect(actual.test('/node_modules/@abc/def/')).toBeTruthy()
    })
  })

  describe('buildExcludeRegexp', () => {
    it('should return a regexp not matching /node_modules/abc/', () => {
      const dependencies = ['abc']
      const actual = buildExcludeRegexp(dependencies)
      expect(actual).toBeInstanceOf(RegExp)
      expect(actual.test('/node_modules/abc/')).toBeFalsy()
    })

    it('returns a regex matching /node_modules/@abc/def/  (namespaced dep)', () => {
      const dependencies = ['@abc/def']
      const actual = buildExcludeRegexp(dependencies)
      expect(actual.test('/node_modules/@abc/def/')).toBeFalsy()
    })
  })
})
