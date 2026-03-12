import { describe, test, expect } from 'vitest'
import GithubSlugger from 'github-slugger'
import { slugHeading } from '../../src/markdown/slugHeading.js'

describe('slugHeading()', () => {

  test('basic heading', () => {
    const slugger = new GithubSlugger()
    expect(slugHeading('My Heading', slugger)).toBe('my-heading')
  })

  test('punctuation stripped', () => {
    const slugger = new GithubSlugger()
    expect(slugHeading('What is this?', slugger)).toBe('what-is-this')
  })

  test('duplicate headings produce distinct slugs', () => {
    const slugger = new GithubSlugger()
    expect(slugHeading('Install', slugger)).toBe('install')
    expect(slugHeading('Install', slugger)).toBe('install-1')
    expect(slugHeading('Install', slugger)).toBe('install-2')
  })

  test('fresh slugger resets duplicate counter', () => {
    const slugger1 = new GithubSlugger()
    slugHeading('Install', slugger1)
    slugHeading('Install', slugger1)

    const slugger2 = new GithubSlugger()
    expect(slugHeading('Install', slugger2)).toBe('install')
  })

})
